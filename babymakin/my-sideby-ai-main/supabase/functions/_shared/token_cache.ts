
/**
 * Smart token caching system to reduce Auth0 M2M token requests
 */

interface CachedToken {
  value: string;
  expiresAt: number;
  refreshThreshold: number; // When to start refreshing (before expiration)
}

interface TokenCacheEntry {
  token: CachedToken | null;
  refreshPromise: Promise<string> | null;
  lastError: Error | null;
  errorCount: number;
}

class TokenCache {
  private cache: Map<string, TokenCacheEntry> = new Map();
  private readonly maxRetries = 3;
  private readonly backoffMultiplier = 2;
  private readonly baseDelay = 1000; // 1 second

  /**
   * Get a cached token or fetch a new one
   */
  async getToken(
    key: string,
    fetcher: () => Promise<{ access_token: string; expires_in: number }>
  ): Promise<string> {
    let entry = this.cache.get(key);
    
    if (!entry) {
      entry = {
        token: null,
        refreshPromise: null,
        lastError: null,
        errorCount: 0
      };
      this.cache.set(key, entry);
    }

    const now = Date.now();
    
    // Check if we have a valid cached token
    if (entry.token && now < entry.token.expiresAt) {
      // If we're within the refresh threshold, start background refresh
      if (now >= entry.token.refreshThreshold && !entry.refreshPromise) {
        console.log(`Starting background token refresh for ${key}`);
        entry.refreshPromise = this.refreshToken(key, fetcher)
          .finally(() => {
            if (entry) entry.refreshPromise = null;
          });
      }
      
      return entry.token.value;
    }

    // If there's already a refresh in progress, wait for it
    if (entry.refreshPromise) {
      console.log(`Waiting for existing token refresh for ${key}`);
      return await entry.refreshPromise;
    }

    // Need to fetch a new token
    console.log(`Fetching new token for ${key}`);
    entry.refreshPromise = this.refreshToken(key, fetcher);
    
    try {
      const token = await entry.refreshPromise;
      return token;
    } finally {
      entry.refreshPromise = null;
    }
  }

  private async refreshToken(
    key: string,
    fetcher: () => Promise<{ access_token: string; expires_in: number }>
  ): Promise<string> {
    const entry = this.cache.get(key)!;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        console.log(`Token refresh attempt ${attempt + 1}/${this.maxRetries} for ${key}`);
        
        const response = await fetcher();
        
        // Calculate expiration with safety margin
        const expiresIn = response.expires_in || 3600; // Default to 1 hour
        const safetyMargin = Math.min(300, expiresIn * 0.1); // 5 minutes or 10% of expiry
        const refreshThreshold = Math.min(600, expiresIn * 0.2); // 10 minutes or 20% of expiry
        
        const expiresAt = Date.now() + (expiresIn * 1000) - (safetyMargin * 1000);
        const refreshAt = Date.now() + (expiresIn * 1000) - (refreshThreshold * 1000);

        entry.token = {
          value: response.access_token,
          expiresAt,
          refreshThreshold: refreshAt
        };
        
        entry.errorCount = 0;
        entry.lastError = null;
        
        console.log(`Token refreshed successfully for ${key}, expires in ${Math.round(expiresIn / 60)} minutes`);
        return response.access_token;
        
      } catch (error) {
        console.error(`Token refresh attempt ${attempt + 1} failed for ${key}:`, error);
        
        entry.errorCount++;
        entry.lastError = error instanceof Error ? error : new Error(String(error));
        
        // If this isn't the last attempt, wait before retrying
        if (attempt < this.maxRetries - 1) {
          const delay = this.baseDelay * Math.pow(this.backoffMultiplier, attempt);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All attempts failed
    const error = new Error(`Failed to refresh token for ${key} after ${this.maxRetries} attempts`);
    entry.lastError = error;
    throw error;
  }

  /**
   * Clear expired tokens from cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.token && now > entry.token.expiresAt + 60000) { // 1 minute grace period
        console.log(`Cleaning up expired token for ${key}`);
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    for (const [key, entry] of this.cache.entries()) {
      const now = Date.now();
      stats[key] = {
        hasToken: !!entry.token,
        isValid: entry.token ? now < entry.token.expiresAt : false,
        expiresIn: entry.token ? Math.max(0, Math.round((entry.token.expiresAt - now) / 1000)) : 0,
        errorCount: entry.errorCount,
        lastError: entry.lastError?.message,
        isRefreshing: !!entry.refreshPromise
      };
    }
    return stats;
  }
}

// Global token cache instance
export const tokenCache = new TokenCache();

// Clean up expired tokens every 10 minutes
setInterval(() => {
  tokenCache.cleanup();
}, 10 * 60 * 1000);
