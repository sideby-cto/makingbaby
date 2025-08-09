import { useCallback, useRef } from 'react';

interface PerformanceMetrics {
  [key: string]: {
    startTime: number;
    endTime?: number;
    duration?: number;
  };
}

export const usePerformanceMonitor = (componentName: string) => {
  const metricsRef = useRef<PerformanceMetrics>({});
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);

  const startMeasure = useCallback((label?: string) => {
    const key = label || 'default';
    const fullKey = `${componentName}:${key}`;
    
    if (process.env.NODE_ENV === 'development') {
      metricsRef.current[fullKey] = {
        startTime: performance.now()
      };
      console.log(`🚀 Performance: Started measuring ${fullKey}`);
    }
  }, [componentName]);

  const endMeasure = useCallback((label?: string) => {
    const key = label || 'default';
    const fullKey = `${componentName}:${key}`;
    
    if (process.env.NODE_ENV === 'development') {
      const metric = metricsRef.current[fullKey];
      if (metric && metric.startTime) {
        const endTime = performance.now();
        const duration = endTime - metric.startTime;
        
        metric.endTime = endTime;
        metric.duration = duration;
        
        // Track render times for average calculation
        renderTimesRef.current.push(duration);
        renderCountRef.current++;
        
        // Keep only last 100 render times to prevent memory leak
        if (renderTimesRef.current.length > 100) {
          renderTimesRef.current = renderTimesRef.current.slice(-100);
        }
        
        const colorCode = duration > 100 ? '🔴' : duration > 50 ? '🟡' : '🟢';
        console.log(`${colorCode} Performance: ${fullKey} took ${duration.toFixed(2)}ms`);
        
        // Warn about slow renders
        if (duration > 100) {
          console.warn(`⚠️ Slow render detected in ${fullKey}: ${duration.toFixed(2)}ms`);
        }
      }
    }
  }, [componentName]);

  const measureAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    label?: string
  ): Promise<T> => {
    const key = label || 'async';
    startMeasure(key);
    
    try {
      const result = await operation();
      endMeasure(key);
      return result;
    } catch (error) {
      endMeasure(key);
      throw error;
    }
  }, [startMeasure, endMeasure]);

  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  const getAverageRenderTime = useCallback(() => {
    const times = renderTimesRef.current;
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }, []);

  return {
    startMeasure,
    endMeasure,
    measureAsync,
    getMetrics,
    getAverageRenderTime,
    renderCount: renderCountRef.current
  };
};
