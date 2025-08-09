
interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private stats = {
    totalRequests: 0,
    deduplicatedRequests: 0,
    activeRequests: 0
  };

  async execute<T>(
    key: string,
    fn: () => Promise<T>,
    timeoutMs: number = 15000
  ): Promise<T> {
    this.stats.totalRequests++;
    
    // Check if there's already a pending request for this key
    const existing = this.pendingRequests.get(key);
    
    if (existing) {
      // Check if the existing request is still valid (not too old)
      const age = Date.now() - existing.timestamp;
      if (age < timeoutMs) {
        console.log(`Deduplicating request for key: ${key} (age: ${age}ms)`);
        this.stats.deduplicatedRequests++;
        return await existing.promise;
      } else {
        // Remove stale request
        this.pendingRequests.delete(key);
      }
    }

    // Create new request
    console.log(`Executing new request for key: ${key}`);
    this.stats.activeRequests++;
    
    const promise = fn().finally(() => {
      this.pendingRequests.delete(key);
      this.stats.activeRequests--;
    });

    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    return await promise;
  }

  getStats() {
    return {
      ...this.stats,
      pendingRequestsCount: this.pendingRequests.size,
      deduplicationRate: this.stats.totalRequests > 0 
        ? (this.stats.deduplicatedRequests / this.stats.totalRequests) * 100 
        : 0
    };
  }

  // Clean up old requests periodically
  cleanup() {
    const now = Date.now();
    const maxAge = 60000; // 1 minute
    
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > maxAge) {
        console.log(`Cleaning up stale request: ${key}`);
        this.pendingRequests.delete(key);
      }
    }
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// Clean up stale requests every 5 minutes
setInterval(() => {
  requestDeduplicator.cleanup();
}, 5 * 60 * 1000);
