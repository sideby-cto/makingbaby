
import { redisTokenCache } from "./redis_token_cache.ts";

const UPDUO_CLIENT_ID = "mzJxi62VLBSHbHnNbQoI2sAh25ln0nM4";
const UPDUO_CLIENT_SECRET = Deno.env.get('UPDUO_CLIENT_SECRET');
const UPDUO_AUTH_URL = "https://auth.upduo.com/oauth/token";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let tokenStats = {
  requests: 0,
  hits: 0,
  misses: 0,
  errors: 0,
  lastRefresh: 0
};

/**
 * Get Upduo access token with smart caching and force refresh option
 */
export async function getUpduoToken(forceRefresh: boolean = false): Promise<string> {
  console.log("Getting Upduo token with Redis-based smart caching...");
  
  if (!UPDUO_CLIENT_SECRET) {
    throw new Error("UPDUO_CLIENT_SECRET environment variable is not set");
  }

  tokenStats.requests++;

  // Force clear cache if requested
  if (forceRefresh) {
    console.log("Force refresh requested, clearing token cache...");
    await redisTokenCache.clearTokenCache('upduo_token');
  }

  try {
    const token = await redisTokenCache.getToken('upduo_token', async () => {
      console.log("Fetching new Upduo token from API with correct endpoint and audience...");
      
      const requestBody = {
        client_id: UPDUO_CLIENT_ID,
        client_secret: UPDUO_CLIENT_SECRET,
        audience: "api.upduo.com",
        grant_type: "client_credentials"
      };

      console.log("OAuth request with audience:", 'api.upduo.com');
      console.log("Using correct auth endpoint:", UPDUO_AUTH_URL);
      
      const response = await fetch(UPDUO_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Upduo token request failed: ${response.status} ${response.statusText}`, errorText);
        console.error("Request body was:", JSON.stringify(requestBody, null, 2));
        tokenStats.errors++;
        throw new Error(`Failed to get Upduo token: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: TokenResponse = await response.json();
      
      if (!data.access_token) {
        tokenStats.errors++;
        throw new Error("No access token in Upduo response");
      }

      tokenStats.lastRefresh = Date.now();
      console.log(`Successfully obtained Upduo token, expires in ${data.expires_in} seconds`);
      console.log("Token should now work with the correct authentication endpoint");
      
      return data;
    });

    return token;
  } catch (error) {
    tokenStats.errors++;
    console.error("Error getting Upduo token:", error);
    throw error;
  }
}

/**
 * Clear Upduo token cache - useful for troubleshooting
 */
export async function clearUpduoTokenCache(): Promise<boolean> {
  console.log("Manually clearing Upduo token cache...");
  return await redisTokenCache.clearTokenCache('upduo_token');
}

/**
 * Get token cache statistics for debugging
 */
export function getTokenCacheStats() {
  return {
    ...tokenStats,
    hitRate: tokenStats.requests > 0 ? (tokenStats.hits / tokenStats.requests) * 100 : 0
  };
}

/**
 * Health check for Upduo authentication
 */
export async function checkUpduoAuthHealth(): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getUpduoToken();
    return { success: !!token };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Unknown auth error'
    };
  }
}
