import { useEffect, useCallback } from 'react';
import { useMemoryLeakProtection } from './useMemoryLeakProtection';

interface UseAnimationCleanupOptions {
  /** Maximum time to wait before forcing cleanup (ms) */
  maxDuration?: number;
  /** Whether to log debug information */
  debug?: boolean;
  /** Cleanup callback */
  onCleanup?: () => void;
}

/**
 * Hook to ensure animation overlays are properly cleaned up
 * Prevents persistent blur effects and memory leaks
 */
export const useAnimationCleanup = (options: UseAnimationCleanupOptions = {}) => {
  const { maxDuration = 10000, debug = false, onCleanup } = options;
  const { safeSetTimeout, createAbortController } = useMemoryLeakProtection();

  const forceCleanup = useCallback(() => {
    try {
      // Only cleanup body overflow and styles, let React handle DOM elements
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }

      // Clear any stuck animation classes on body
      document.body.classList.remove('overflow-hidden');

      onCleanup?.();

      if (debug) {
        console.log('Animation cleanup completed');
      }
    } catch (error) {
      console.error('Failed to cleanup animations:', error);
    }
  }, [debug, onCleanup]);

  const startAnimation = useCallback((animationElement?: HTMLElement) => {
    if (debug) {
      console.log('Starting animation with cleanup timer');
    }

    // Set emergency cleanup timer
    const emergencyTimeout = safeSetTimeout(() => {
      if (debug) {
        console.warn('Emergency animation cleanup triggered');
      }
      forceCleanup();
    }, maxDuration);

    // Create abort controller for the animation
    const controller = createAbortController();

    // Return cleanup function
    return {
      cleanup: forceCleanup,
      abort: () => controller.abort(),
      emergencyTimeout
    };
  }, [debug, maxDuration, forceCleanup, safeSetTimeout, createAbortController]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      forceCleanup();
    };
  }, [forceCleanup]);

  // Monitor for stuck body styles in development
  useEffect(() => {
    if (debug && process.env.NODE_ENV === 'development') {
      const monitorInterval = setInterval(() => {
        if (document.body.style.overflow === 'hidden') {
          console.warn('Body overflow is still hidden - potential stuck animation');
        }
      }, 30000);

      return () => clearInterval(monitorInterval);
    }
  }, [debug]);

  return {
    startAnimation,
    forceCleanup,
    isCleanupAvailable: true
  };
};