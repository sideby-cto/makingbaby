
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  shouldRetry: (error: any, attempt: number) => {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error?.message?.includes('network') || 
        error?.message?.includes('timeout') ||
        error?.status >= 500) {
      return attempt < 3;
    }
    return false;
  }
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const opts = { ...defaultOptions, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      console.log(`[Retry] Attempt ${attempt + 1}/${opts.maxRetries + 1}`);
      const result = await operation();
      if (attempt > 0) {
        console.log(`[Retry] Success on attempt ${attempt + 1}`);
      }
      return result;
    } catch (error) {
      lastError = error;
      console.error(`[Retry] Attempt ${attempt + 1} failed:`, error);

      if (attempt === opts.maxRetries || !opts.shouldRetry(error, attempt)) {
        break;
      }

      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelay
      );
      
      console.log(`[Retry] Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
