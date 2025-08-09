import { useState, useEffect, useRef, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

interface UseLoadingStateOptions {
  minimumLoadTime?: number;
  debounceTime?: number;
  onLoadingChange?: (isLoading: boolean) => void;
}

export const useLoadingStateManager = (options: UseLoadingStateOptions = {}) => {
  const {
    minimumLoadTime = 300,
    debounceTime = 100,
    onLoadingChange
  } = options;

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false
  });

  const loadingStartTime = useRef<number | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isUnmounted = useRef(false);

  useEffect(() => {
    return () => {
      isUnmounted.current = true;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const setLoading = useCallback((isLoading: boolean, message?: string, progress?: number) => {
    if (isUnmounted.current) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (isUnmounted.current) return;

      if (isLoading) {
        loadingStartTime.current = Date.now();
        setLoadingState({ isLoading, message, progress });
        onLoadingChange?.(true);
      } else {
        const endLoading = () => {
          if (isUnmounted.current) return;
          setLoadingState({ isLoading: false });
          onLoadingChange?.(false);
        };

        // Ensure minimum loading time to prevent flicker
        if (loadingStartTime.current) {
          const elapsed = Date.now() - loadingStartTime.current;
          if (elapsed < minimumLoadTime) {
            setTimeout(endLoading, minimumLoadTime - elapsed);
          } else {
            endLoading();
          }
        } else {
          endLoading();
        }
      }
    }, debounceTime);
  }, [minimumLoadTime, debounceTime, onLoadingChange]);

  const updateProgress = useCallback((progress: number) => {
    if (isUnmounted.current) return;
    setLoadingState(prev => ({ ...prev, progress }));
  }, []);

  const updateMessage = useCallback((message: string) => {
    if (isUnmounted.current) return;
    setLoadingState(prev => ({ ...prev, message }));
  }, []);

  return {
    ...loadingState,
    setLoading,
    updateProgress,
    updateMessage
  };
};