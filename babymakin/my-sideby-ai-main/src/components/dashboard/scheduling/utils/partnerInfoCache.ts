
import { PartnerInfo } from "../types";

// In-memory cache for partner info
const partnerInfoCache: Map<string, { data: PartnerInfo; timestamp: number; matchId: string }> = new Map();

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

// Generate a unique cache key for a partner - now uses partner ID as primary key
const getCacheKey = (matchId: string, partnerId: string): string => {
  return `${partnerId}:${matchId}`;
};

// Validate if cached data is still fresh and belongs to the correct match
const isCacheValid = (cacheEntry: { data: PartnerInfo; timestamp: number; matchId: string }, matchId: string): boolean => {
  const isNotExpired = Date.now() - cacheEntry.timestamp < CACHE_EXPIRATION_MS;
  const isCorrectMatch = cacheEntry.matchId === matchId;
  const hasValidPartnerId = cacheEntry.data.id && cacheEntry.data.id !== 'unknown';
  
  return isNotExpired && isCorrectMatch && hasValidPartnerId;
};

// Cache partner info with validation
export const cachePartnerInfo = (
  matchId: string, 
  partnerId: string, 
  partnerInfo: PartnerInfo
): void => {
  // Don't cache invalid data
  if (!partnerId || partnerId === 'unknown' || !matchId || !partnerInfo.id) {
    console.warn('Attempted to cache invalid partner info:', { matchId, partnerId, partnerInfo });
    return;
  }

  const cacheKey = getCacheKey(matchId, partnerId);
  const cacheEntry = {
    data: partnerInfo,
    timestamp: Date.now(),
    matchId
  };
  
  partnerInfoCache.set(cacheKey, cacheEntry);
  console.log(`Cached partner info for match ${matchId}, partner ${partnerId}`);
};

// Retrieve cached partner info with validation
export const getCachedPartnerInfo = (
  matchId: string, 
  partnerId: string
): PartnerInfo | null => {
  if (!partnerId || partnerId === 'unknown' || !matchId) {
    return null;
  }

  const cacheKey = getCacheKey(matchId, partnerId);
  const cacheEntry = partnerInfoCache.get(cacheKey);
  
  if (!cacheEntry) {
    console.log(`Cache miss for match ${matchId}, partner ${partnerId}`);
    return null;
  }

  if (!isCacheValid(cacheEntry, matchId)) {
    console.log(`Cache invalid for match ${matchId}, partner ${partnerId} - clearing`);
    partnerInfoCache.delete(cacheKey);
    return null;
  }

  console.log(`Cache hit for match ${matchId}, partner ${partnerId}`);
  return cacheEntry.data;
};

// Clear specific partner info from cache
export const clearCachedPartnerInfo = (
  matchId: string, 
  partnerId: string
): void => {
  if (!partnerId || !matchId) return;
  
  const cacheKey = getCacheKey(matchId, partnerId);
  partnerInfoCache.delete(cacheKey);
  console.log(`Cleared cache for match ${matchId}, partner ${partnerId}`);
};

// Clear all cached partner info for a specific match
export const clearMatchPartnerCache = (matchId: string): void => {
  if (!matchId) return;
  
  const keysToDelete: string[] = [];
  
  partnerInfoCache.forEach((value, key) => {
    if (value.matchId === matchId) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => partnerInfoCache.delete(key));
  console.log(`Cleared all partner cache for match ${matchId}, removed ${keysToDelete.length} entries`);
};

// Clear all cached partner info
export const clearPartnerInfoCache = (): void => {
  const size = partnerInfoCache.size;
  partnerInfoCache.clear();
  console.log(`Cleared entire partner cache, removed ${size} entries`);
};

// Get cache statistics for debugging
export const getCacheStats = () => {
  const stats = {
    totalEntries: partnerInfoCache.size,
    validEntries: 0,
    expiredEntries: 0,
    entries: [] as Array<{ key: string; matchId: string; partnerId: string; isValid: boolean; age: number }>
  };
  
  partnerInfoCache.forEach((value, key) => {
    const [partnerId, matchId] = key.split(':');
    const age = Date.now() - value.timestamp;
    const isValid = isCacheValid(value, value.matchId);
    
    if (isValid) {
      stats.validEntries++;
    } else {
      stats.expiredEntries++;
    }
    
    stats.entries.push({
      key,
      matchId: value.matchId,
      partnerId,
      isValid,
      age
    });
  });
  
  return stats;
};
