
const UPSTASH_REDIS_REST_URL = Deno.env.get('UPSTASH_REDIS_REST_URL');
const UPSTASH_REDIS_REST_TOKEN = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

export interface RedisResponse {
  result?: any;
  error?: string;
}

export class RedisClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Redis configuration missing: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN');
    }
    
    // Improved URL format handling
    let url = UPSTASH_REDIS_REST_URL.trim();
    
    // Remove trailing slash if present
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    
    // Ensure proper protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    // Ensure the URL ends with the correct REST endpoint
    if (!url.endsWith('/')) {
      url = `${url}/`;
    }
    
    this.baseUrl = url;
    this.token = UPSTASH_REDIS_REST_TOKEN;
    
    console.log(`Redis client initialized with URL: ${url.replace(this.token, '[REDACTED]')}`);
  }

  private async execute(command: string[]): Promise<RedisResponse> {
    try {
      console.log(`Executing Redis command: ${command[0]} ${command.slice(1).map(arg => arg.length > 50 ? `${arg.substring(0, 50)}...` : arg).join(' ')}`);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Redis request failed: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Redis request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`Redis command ${command[0]} executed successfully`);
      return data;
    } catch (error) {
      console.error('Redis operation failed:', error);
      return { error: error.message || 'Unknown Redis error' };
    }
  }

  async get(key: string): Promise<string | null> {
    const response = await this.execute(['GET', key]);
    if (response.error) {
      console.warn(`Redis GET failed for key ${key}:`, response.error);
      return null;
    }
    return response.result;
  }

  async set(key: string, value: string, expirationSeconds?: number): Promise<boolean> {
    const command = expirationSeconds 
      ? ['SET', key, value, 'EX', expirationSeconds.toString()]
      : ['SET', key, value];
    
    const response = await this.execute(command);
    if (response.error) {
      console.warn(`Redis SET failed for key ${key}:`, response.error);
      return false;
    }
    return response.result === 'OK';
  }

  async del(key: string): Promise<boolean> {
    const response = await this.execute(['DEL', key]);
    if (response.error) {
      console.warn(`Redis DEL failed for key ${key}:`, response.error);
      return false;
    }
    return response.result === 1;
  }

  async exists(key: string): Promise<boolean> {
    const response = await this.execute(['EXISTS', key]);
    if (response.error) {
      console.warn(`Redis EXISTS failed for key ${key}:`, response.error);
      return false;
    }
    return response.result === 1;
  }

  // Health check method
  async ping(): Promise<boolean> {
    try {
      const response = await this.execute(['PING']);
      return response.result === 'PONG' && !response.error;
    } catch (error) {
      console.error('Redis ping failed:', error);
      return false;
    }
  }
}

// Cache key generators
export const getCacheKey = {
  sessions: (params: { count: number; cursor?: string; timestamp?: string; includeTranscript: boolean; includeCompleted: boolean }) => {
    const key = `sessions:${params.count}:${params.cursor || 'none'}:${params.timestamp || 'none'}:${params.includeTranscript}:${params.includeCompleted}`;
    return key;
  },
  sessionDetail: (sessionId: string) => `session:${sessionId}`,
  enhancedAnalysis: (transcriptId: string) => `enhanced_analysis:${transcriptId}`,
  userSemanticProfile: (userId: string) => `user_semantic:${userId}`,
  topicEmbeddings: (topic: string) => `topic_embedding:${btoa(topic).slice(0, 50)}`,
  tokenCache: (tokenKey: string) => `token_cache:${tokenKey}`,
};

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SESSIONS_LIST: 300, // 5 minutes for session lists
  SESSION_DETAIL: 900, // 15 minutes for individual sessions
  LONG_TERM: 3600, // 1 hour for stable data
  ENHANCED_ANALYSIS: 86400, // 24 hours for enhanced analysis
  EMBEDDINGS: 604800, // 1 week for topic embeddings
  TOKEN_CACHE: 7200, // 2 hours for token cache metadata
};
