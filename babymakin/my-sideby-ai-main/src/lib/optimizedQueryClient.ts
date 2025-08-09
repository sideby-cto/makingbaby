
import { QueryClient } from "@tanstack/react-query";

// Optimized configuration to prevent memory leaks and crashes
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors except 429 (rate limit)
          if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        // Prevent excessive refetching
        refetchInterval: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
};

// Memory monitoring utilities
export const monitorQueryCache = (queryClient: QueryClient) => {
  const logCacheSize = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    console.log(`Query cache size: ${queries.length} queries`);
    
    // Log queries that might be causing memory issues
    const staleCacheEntries = queries.filter(query => 
      query.state.dataUpdateCount > 10 || 
      (query.state.data && JSON.stringify(query.state.data).length > 1000000) // 1MB threshold
    );
    
    if (staleCacheEntries.length > 0) {
      console.warn(`Found ${staleCacheEntries.length} potentially memory-heavy queries`);
    }
  };

  // Log cache size every 30 seconds in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(logCacheSize, 30000);
  }
};
