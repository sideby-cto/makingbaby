
import { useEffect, useRef, useCallback } from 'react';

export const useMemoryLeakProtection = () => {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const abortControllersRef = useRef<Set<AbortController>>(new Set());

  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = setTimeout(callback, delay);
    timeoutsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  const safeSetInterval = useCallback((callback: () => void, delay: number) => {
    const intervalId = setInterval(callback, delay);
    intervalsRef.current.add(intervalId);
    return intervalId;
  }, []);

  const createAbortController = useCallback(() => {
    const controller = new AbortController();
    abortControllersRef.current.add(controller);
    return controller;
  }, []);

  const clearSafeTimeout = useCallback((timeoutId: NodeJS.Timeout) => {
    clearTimeout(timeoutId);
    timeoutsRef.current.delete(timeoutId);
  }, []);

  const clearSafeInterval = useCallback((intervalId: NodeJS.Timeout) => {
    clearInterval(intervalId);
    intervalsRef.current.delete(intervalId);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current.clear();

      // Clear all intervals
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current.clear();

      // Abort all controllers
      abortControllersRef.current.forEach(controller => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      });
      abortControllersRef.current.clear();
    };
  }, []);

  return {
    safeSetTimeout,
    safeSetInterval,
    createAbortController,
    clearSafeTimeout,
    clearSafeInterval,
  };
};
