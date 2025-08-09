
import { getUpduoToken, getTokenCacheStats } from "../_shared/upduo_auth.ts";
import { requestDeduplicator } from "../_shared/request_deduplication.ts";
import { RedisClient, getCacheKey, CACHE_TTL } from "../_shared/redis_client.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const UPDUO_API_URL = "https://api.upduo.com/api/graphql";
const ORG_ID = "org_rdpDlfhGHCB4ZQEY";
const API_TIMEOUT = 45000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// Enhanced circuit breaker with better error categorization
class CircuitBreaker {
  failures = 0;
  lastFailureTime = 0;
  threshold = 5;
  timeout = 60000;
  
  // Track different types of failures
  authFailures = 0;
  networkFailures = 0;
  graphqlFailures = 0;

  isOpen() {
    if (this.failures >= this.threshold) {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        console.log("Circuit breaker: Attempting to reset");
        this.failures = 0;
        this.authFailures = 0;
        this.networkFailures = 0;
        this.graphqlFailures = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess() {
    this.failures = 0;
    this.authFailures = 0;
    this.networkFailures = 0;
    this.graphqlFailures = 0;
  }

  recordFailure(errorType: 'auth' | 'network' | 'graphql' = 'network') {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    switch (errorType) {
      case 'auth':
        this.authFailures++;
        break;
      case 'graphql':
        this.graphqlFailures++;
        break;
      default:
        this.networkFailures++;
    }
    
    console.log(`Circuit breaker: Recorded ${errorType} failure ${this.failures}/${this.threshold}`);
  }

  getStats() {
    return {
      failures: this.failures,
      authFailures: this.authFailures,
      networkFailures: this.networkFailures,
      graphqlFailures: this.graphqlFailures,
      isOpen: this.isOpen(),
      lastFailureTime: this.lastFailureTime,
      threshold: this.threshold
    };
  }
}

const circuitBreaker = new CircuitBreaker();

async function getUpduoSessionsWithCache(token: string, options: any, redis: RedisClient | null) {
  const { count = 50, cursor, timestamp, includeTranscript = false, includeCompleted = false } = options;
  
  // Generate cache key
  const cacheKey = getCacheKey.sessions({
    count,
    cursor,
    timestamp,
    includeTranscript,
    includeCompleted
  });

  console.log(`Checking cache for key: ${cacheKey}`);

  // Try to get from cache first
  if (redis) {
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return {
          ...JSON.parse(cachedData),
          cacheStatus: 'hit'
        };
      }
      console.log(`Cache miss for key: ${cacheKey}`);
    } catch (error) {
      console.warn(`Cache read error for key ${cacheKey}:`, error);
    }
  }

  // Check circuit breaker
  if (circuitBreaker.isOpen()) {
    throw new Error("Circuit breaker is open - too many recent failures");
  }

  console.log(`Fetching Upduo sessions from API using GetSelfGroupActivity query (count: ${count}, cursor: ${cursor || "none"}, timestamp: ${timestamp || "none"})`);

  // Construct variables with improved validation according to documentation
  const variables: any = {
    count: Math.min(Math.max(parseInt(count) || 50, 1), 100)
  };

  // Only add cursor if it's a valid non-empty string
  if (cursor && typeof cursor === "string" && cursor.trim() !== "" && cursor !== "none") {
    variables.cursor = cursor.trim();
  }

  // Handle timestamp filtering according to documentation
  if (timestamp && !isNaN(Number(timestamp))) {
    const timestampMs = Number(timestamp);
    variables.filterParams = {
      startDate: timestampMs,
      dateTypeFilter: "LAST_CREATED"
    };
  }

  // Add completion filter if requested
  if (includeCompleted) {
    variables.filterParams = {
      ...variables.filterParams,
      includeNotApprovedSessions: true
    };
  }

  // Use the exact GraphQL query from the documentation
  const query = `
    query GetSelfGroupActivity($count: Int, $cursor: ID, $filterParams: ActivityFilterParams) {
      self {
        id
        group {
          id
          sessions(count: $count, cursor: $cursor, filterParams: $filterParams) {
            id
            items {
              id
              createdAt
              duration
              type
              users {
                id
                firstName
                lastName
              }
              knowledgeNodes {
                id
                name
                tags {
                  id
                  contentTag {
                    id
                    name
                  }
                }
              }
              ${includeTranscript ? `
              transcriptContents {
                speaker
                text
                startTime
                endTime
              }` : ""}
            }
            hasNextPage
            cursor
          }
        }
      }
    }
  `;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    console.log(`Making GraphQL request to GetSelfGroupActivity with variables:`, JSON.stringify(variables, null, 2));

    // Use the correct endpoint format from documentation
    const response = await fetch(`${UPDUO_API_URL}?org_id=${ORG_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Organization": ORG_ID
      },
      body: JSON.stringify({
        query,
        variables
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch Upduo sessions: ${response.status} ${response.statusText}`, errorText);
      
      // Categorize the error
      if (response.status === 401 || response.status === 403) {
        circuitBreaker.recordFailure('auth');
      } else {
        circuitBreaker.recordFailure('network');
      }
      
      throw new Error(`Failed to fetch Upduo sessions: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Check for GraphQL errors
    if (data.errors) {
      const errorMessage = data.errors[0]?.message || JSON.stringify(data.errors);
      console.error("GraphQL error:", errorMessage);
      circuitBreaker.recordFailure('graphql');
      throw new Error(`GraphQL errors: ${errorMessage}`);
    }

    // Validate response structure according to documentation
    if (!data.data?.self?.group?.sessions) {
      console.error("Unexpected response structure:", data);
      console.log("Expected structure: data.self.group.sessions, got:", JSON.stringify(data, null, 2));
      circuitBreaker.recordFailure('graphql');
      throw new Error("Invalid response structure from Upduo API - missing self.group.sessions");
    }

    const sessionsCount = data.data.self.group.sessions.items?.length || 0;
    console.log(`Successfully fetched ${sessionsCount} Upduo sessions using GetSelfGroupActivity query`);

    // Record success for circuit breaker
    circuitBreaker.recordSuccess();

    // Cache the successful response
    if (redis) {
      try {
        const ttl = includeTranscript ? CACHE_TTL.SESSIONS_LIST : CACHE_TTL.LONG_TERM;
        const responseToCache = {
          ...data,
          cacheStatus: 'miss',
          cachedAt: new Date().toISOString()
        };
        
        await redis.set(cacheKey, JSON.stringify(responseToCache), ttl);
        console.log(`Cached response for key: ${cacheKey} (TTL: ${ttl}s)`);
      } catch (cacheError) {
        console.warn(`Failed to cache response for key ${cacheKey}:`, cacheError);
      }
    }

    return {
      ...data,
      cacheStatus: 'miss'
    };

  } catch (error) {
    console.error("Error fetching Upduo sessions:", error);
    
    // Don't record circuit breaker failures for timeout/abort errors
    if (!error.name?.includes('Abort') && !error.message?.includes('timeout')) {
      circuitBreaker.recordFailure();
    }
    
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Parse request parameters with better error handling
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      console.log("Request body parsing error, using defaults:", e.message);
      requestData = {};
    }

    const count = Math.min(Math.max(parseInt(requestData.count || "50", 10), 1), 100);
    const cursor = requestData.cursor || undefined;
    const timestamp = requestData.timestamp || undefined;
    const includeTranscript = Boolean(requestData.includeTranscript);
    const includeCompleted = Boolean(requestData.includeCompleted);

    console.log(`Processing GetSelfGroupActivity request with params: count=${count}, cursor=${cursor || "none"}, timestamp=${timestamp || "none"}, includeTranscript=${includeTranscript}`);

    // Initialize Redis client with health check
    let redis: RedisClient | null = null;
    try {
      redis = new RedisClient();
      const isHealthy = await redis.ping();
      if (!isHealthy) {
        console.warn("Redis health check failed, proceeding without cache");
        redis = null;
      } else {
        console.log("Redis client initialized and healthy");
      }
    } catch (redisError) {
      console.warn("Redis initialization failed, proceeding without cache:", redisError.message);
      redis = null;
    }

    // Create a unique key for request deduplication
    const requestKey = `sessions-${count}-${cursor || 'none'}-${timestamp || 'none'}-${includeTranscript}-${includeCompleted}`;

    // Execute with request deduplication
    const result = await requestDeduplicator.execute(requestKey, async () => {
      // Get token with smart caching
      const token = await getUpduoToken();
      
      // Fetch sessions with Redis caching if available
      return await getUpduoSessionsWithCache(token, {
        count,
        cursor,
        timestamp,
        includeTranscript,
        includeCompleted
      }, redis);
    }, 15000);

    // Return sessions data with enhanced headers
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Cache-Status": redis ? "enabled" : "disabled",
        "X-Circuit-Breaker": circuitBreaker.isOpen() ? "open" : "closed"
      }
    });

  } catch (error) {
    console.error("Function error:", error);
    
    // Include comprehensive debug information
    const debugInfo = {
      error: error.message || "Unknown error",
      tokenCacheStats: getTokenCacheStats(),
      circuitBreakerStats: circuitBreaker.getStats(),
      requestDeduplicationStats: requestDeduplicator.getStats(),
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      error: error.message || "Unknown error",
      success: false,
      debug: debugInfo,
      // Include empty data structure to allow frontend to continue
      data: {
        self: {
          group: {
            sessions: {
              items: [],
              hasNextPage: false,
              cursor: null
            }
          }
        }
      }
    }), {
      status: 200, // Return 200 to prevent frontend errors
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
