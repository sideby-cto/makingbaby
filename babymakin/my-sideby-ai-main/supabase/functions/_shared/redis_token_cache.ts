import { RedisClient, CACHE_TTL } from "./redis_client.ts";

interface TokenData {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface CachedToken {
  token: string;
  expiresAt: number;
  tokenType: string;
}

interface TokenStats {
  cacheHits: number;
  cacheMisses: number;
  refreshCount: number;
  lastRefresh: number;
  isValid: boolean;
  isRefreshing: boolean;
}

export class RedisTokenCache {
  private redis: RedisClient;
  private refreshPromises: Map<string, Promise<string>> = new Map();

  constructor() {
    try {
      this.redis = new RedisClient();
    } catch (error) {
      console.warn("Redis not available, token caching disabled:", error.message);
      this.redis = null;
    }
  }

  async getToken(key: string, tokenFetcher: () => Promise<TokenData>): Promise<string> {
    if (!this.redis) {
      // Fallback to direct token fetch if Redis is not available
      const tokenData = await tokenFetcher();
      return tokenData.access_token;
    }

    try {
      // Check for cached token
      const cachedData = await this.redis.get(`enhanced_analysis:token:${key}`);
      if (cachedData) {
        const cached: CachedToken = JSON.parse(cachedData);
        if (cached.expiresAt > Date.now()) {
          await this.incrementStats(key, 'hit');
          return cached.token;
        }
      }

      await this.incrementStats(key, 'miss');

      // Check if another instance is already refreshing this token
      if (this.refreshPromises.has(key)) {
        console.log(`Another instance is refreshing token for ${key}, waiting...`);
        return await this.refreshPromises.get(key)!;
      }

      // Acquire lock and refresh token
      const lockAcquired = await this.acquireLock(key);
      if (!lockAcquired) {
        console.log(`Another instance is refreshing token for ${key}, waiting...`);
        // Wait a bit and try to get the cached token again
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newCachedData = await this.redis.get(`enhanced_analysis:token:${key}`);
        if (newCachedData) {
          const newCached: CachedToken = JSON.parse(newCachedData);
          if (newCached.expiresAt > Date.now()) {
            return newCached.token;
          }
        }
      }

      // Refresh the token
      const refreshPromise = this.refreshToken(key, tokenFetcher);
      this.refreshPromises.set(key, refreshPromise);

      try {
        const token = await refreshPromise;
        return token;
      } finally {
        this.refreshPromises.delete(key);
        await this.releaseLock(key);
      }

    } catch (error) {
      console.warn(`Token cache error for ${key}:`, error);
      // Fallback to direct fetch
      const tokenData = await tokenFetcher();
      return tokenData.access_token;
    }
  }

  private async refreshToken(key: string, tokenFetcher: () => Promise<TokenData>): Promise<string> {
    try {
      console.log(`Fetching new token for ${key}`);
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Token refresh attempt ${attempt}/3 for ${key}`);
          const tokenData = await tokenFetcher();
          
          // Cache the token with a buffer (expire 5 minutes before actual expiry)
          const expiresAt = Date.now() + (tokenData.expires_in - 300) * 1000;
          const cachedToken: CachedToken = {
            token: tokenData.access_token,
            expiresAt,
            tokenType: tokenData.token_type
          };

          await this.redis.set(
            `enhanced_analysis:token:${key}`,
            JSON.stringify(cachedToken),
            tokenData.expires_in - 300
          );

          await this.updateStats(key, {
            refreshCount: 1,
            lastRefresh: Date.now(),
            isValid: true,
            isRefreshing: false
          });

          console.log(`Token refreshed successfully for ${key}, expires in ${Math.floor(tokenData.expires_in / 60)} minutes`);
          return tokenData.access_token;

        } catch (error) {
          console.error(`Token refresh attempt ${attempt} failed for ${key}:`, error);
          if (attempt === 3) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    } catch (error) {
      await this.updateStats(key, {
        isValid: false,
        isRefreshing: false
      });
      throw error;
    }
  }

  private async acquireLock(key: string): Promise<boolean> {
    try {
      const lockKey = `token_lock:${key}`;
      const lockValue = Date.now().toString();
      const acquired = await this.redis.set(lockKey, lockValue, 30); // 30 second lock
      return acquired;
    } catch (error) {
      console.warn(`Failed to acquire lock for ${key}:`, error);
      return false;
    }
  }

  private async releaseLock(key: string): Promise<void> {
    try {
      const lockKey = `token_lock:${key}`;
      await this.redis.del(lockKey);
    } catch (error) {
      console.warn(`Failed to release lock for ${key}:`, error);
    }
  }

  private async incrementStats(key: string, type: 'hit' | 'miss'): Promise<void> {
    try {
      const statsKey = `token_stats:${key}`;
      const existing = await this.redis.get(statsKey);
      const stats: Partial<TokenStats> = existing ? JSON.parse(existing) : {};
      
      if (type === 'hit') {
        stats.cacheHits = (stats.cacheHits || 0) + 1;
      } else {
        stats.cacheMisses = (stats.cacheMisses || 0) + 1;
      }

      await this.redis.set(statsKey, JSON.stringify(stats), CACHE_TTL.TOKEN_CACHE);
    } catch (error) {
      // Don't fail the request if stats update fails
      console.warn(`Failed to update stats for ${key}:`, error);
    }
  }

  private async updateStats(key: string, updates: Partial<TokenStats>): Promise<void> {
    try {
      const statsKey = `token_stats:${key}`;
      const existing = await this.redis.get(statsKey);
      const stats: Partial<TokenStats> = existing ? JSON.parse(existing) : {};
      
      Object.assign(stats, updates);
      await this.redis.set(statsKey, JSON.stringify(stats), CACHE_TTL.TOKEN_CACHE);
    } catch (error) {
      console.warn(`Failed to update stats for ${key}:`, error);
    }
  }

  async getStats(): Promise<Record<string, TokenStats>> {
    if (!this.redis) return {};
    
    try {
      // This is a simplified version - in a real implementation you'd need to scan for all token stats keys
      const statsKey = `token_stats:upduo_token`;
      const data = await this.redis.get(statsKey);
      if (data) {
        return { upduo_token: JSON.parse(data) };
      }
      return {};
    } catch (error) {
      console.warn("Failed to get token stats:", error);
      return {};
    }
  }

  async getHealth(): Promise<{ redis: boolean; tokenCache: boolean }> {
    try {
      if (!this.redis) {
        return { redis: false, tokenCache: false };
      }
      
      // Test Redis connectivity
      await this.redis.set('health_check', 'ok', 10);
      const result = await this.redis.get('health_check');
      
      return { 
        redis: result === 'ok', 
        tokenCache: true 
      };
    } catch (error) {
      return { redis: false, tokenCache: false };
    }
  }

  async invalidateToken(key: string): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      await this.redis.del(`enhanced_analysis:token:${key}`);
      return true;
    } catch (error) {
      console.warn(`Failed to invalidate token ${key}:`, error);
      return false;
    }
  }

  async clearTokenCache(key: string): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      console.log(`Clearing token cache for key: ${key}`);
      await this.redis.del(`enhanced_analysis:token:${key}`);
      await this.redis.del(`token_lock:${key}`);
      await this.redis.del(`token_stats:${key}`);
      console.log(`Successfully cleared token cache for key: ${key}`);
      return true;
    } catch (error) {
      console.warn(`Failed to clear token cache for ${key}:`, error);
      return false;
    }
  }

  async clearAllTokenCaches(): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      console.log("Clearing all token caches...");
      // Clear Upduo token cache specifically
      await this.clearTokenCache('upduo_token');
      console.log("Successfully cleared all token caches");
      return true;
    } catch (error) {
      console.warn("Failed to clear all token caches:", error);
      return false;
    }
  }
}

export const redisTokenCache = new RedisTokenCache();
