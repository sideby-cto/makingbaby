import { useState, useCallback } from 'react';
import { withRetry, RetryOptions } from '@/utils/retryUtils';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useMemoryLeakProtection } from '@/hooks/useMemoryLeakProtection';

interface ResilientQueryOptions extends Partial<RetryOptions> {
  enableRetry?: boolean;
  networkAware?: boolean;
}

interface ResilientQueryReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
  reset: () => void;
}

export const useResilientQuery = <T>(
  queryFn: () => Promise<T>,
  options: ResilientQueryOptions = {}
): ResilientQueryReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const { createAbortController } = useMemoryLeakProtection();

  const {
    enableRetry = true,
    networkAware = true,
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 15000,
    ...retryOptions
  } = options;

  const execute = useCallback(async () => {
    if (networkAware && !isOnline) {
      setError(new Error('No internet connection'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = createAbortController();
      
      const operation = async () => {
        // Add abort signal support if the query function accepts it
        return await queryFn();
      };

      let result: T;
      
      if (enableRetry) {
        result = await withRetry(operation, {
          maxRetries: isSlowConnection ? Math.max(1, maxRetries - 1) : maxRetries,
          initialDelay: isSlowConnection ? initialDelay * 2 : initialDelay,
          maxDelay,
          shouldRetry: (error: any, attempt: number) => {
            // Enhanced retry logic for database timeouts
            if (error?.message?.includes('timeout') || 
                error?.message?.includes('network') ||
                error?.message?.includes('canceling statement') ||
                error?.code === 'PGRST301' || // PostgreSQL timeout
                error?.status >= 500) {
              return attempt < (isSlowConnection ? Math.max(1, maxRetries - 1) : maxRetries);
            }
            return false;
          },
          ...retryOptions
        });
      } else {
        result = await operation();
      }

      setData(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Resilient query failed:', {
        message: error.message,
        networkStatus: { isOnline, isSlowConnection },
        timestamp: new Date().toISOString(),
        enableRetry,
        networkAware
      });
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, enableRetry, networkAware, isOnline, isSlowConnection, maxRetries, initialDelay, maxDelay, createAbortController]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset
  };
};