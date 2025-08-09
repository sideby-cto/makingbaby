
import { Profile } from "@/types/profile";

interface CacheEntry {
  data: Profile;
  timestamp: number;
  ttl: number;
}

class ProfileCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set(userId: string, profile: Profile, ttl: number = this.DEFAULT_TTL): void {
    console.log(`[ProfileCache] Caching profile for user ${userId}`);
    this.cache.set(userId, {
      data: profile,
      timestamp: Date.now(),
      ttl
    });
  }

  get(userId: string): Profile | null {
    const entry = this.cache.get(userId);
    if (!entry) {
      console.log(`[ProfileCache] No cache entry for user ${userId}`);
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      console.log(`[ProfileCache] Cache expired for user ${userId}`);
      this.cache.delete(userId);
      return null;
    }

    console.log(`[ProfileCache] Cache hit for user ${userId}`);
    return entry.data;
  }

  invalidate(userId: string): void {
    console.log(`[ProfileCache] Invalidating cache for user ${userId}`);
    this.cache.delete(userId);
  }

  clear(): void {
    console.log(`[ProfileCache] Clearing all cache`);
    this.cache.clear();
  }

  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

export const profileCache = new ProfileCacheService();
