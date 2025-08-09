import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  pageLoadTime: number;
  renderTime: number;
  memoryUsage?: number;
  connectionLatency?: number;
}

export const usePerformanceImprovement = () => {
  const { toast } = useToast();

  const logPerformanceMetric = useCallback(async (metrics: PerformanceMetrics, severity: 'low' | 'medium' | 'high' | 'critical') => {
    try {
      const { error } = await supabase.from('chaos_test_logs').insert({
        test_session_id: 'performance-monitoring',
        test_type: 'performance',
        severity,
        description: `Performance issue detected: Page load ${metrics.pageLoadTime}ms, Render ${metrics.renderTime}ms`,
        location: window.location.href,
        metadata: metrics as any,
        user_action: 'Automatic performance monitoring',
        reproduction_steps: [
          `Navigate to ${window.location.href}`,
          'Monitor performance metrics',
          `Page load time: ${metrics.pageLoadTime}ms`,
          `Render time: ${metrics.renderTime}ms`
        ]
      });

      if (error) {
        console.error('Failed to log performance metric:', error);
      }
    } catch (err) {
      console.error('Error logging performance metric:', err);
    }
  }, []);

  const measurePagePerformance = useCallback(() => {
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    
    if (navigationEntries.length > 0) {
      const entry = navigationEntries[0];
      const pageLoadTime = entry.loadEventEnd - entry.fetchStart;
      const renderTime = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
      
      let memoryUsage: number | undefined;
      if ((window.performance as any).memory) {
        const memory = (window.performance as any).memory;
        memoryUsage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
      }

      const metrics: PerformanceMetrics = {
        pageLoadTime,
        renderTime,
        memoryUsage
      };

      // Determine severity and show appropriate notifications
      if (pageLoadTime > 10000) { // 10+ seconds
        logPerformanceMetric(metrics, 'critical');
        toast({
          title: "Critical Performance Issue",
          description: `Page took ${(pageLoadTime / 1000).toFixed(1)}s to load. This severely impacts user experience.`,
          variant: "destructive",
        });
      } else if (pageLoadTime > 5000) { // 5+ seconds
        logPerformanceMetric(metrics, 'high');
        toast({
          title: "Slow Page Load",
          description: `Page took ${(pageLoadTime / 1000).toFixed(1)}s to load. Consider optimizing.`,
          variant: "destructive",
        });
      } else if (pageLoadTime > 3000) { // 3+ seconds
        logPerformanceMetric(metrics, 'medium');
      }

      if (memoryUsage && memoryUsage > 90) {
        toast({
          title: "High Memory Usage",
          description: `Memory usage is at ${memoryUsage.toFixed(1)}%. Consider refreshing the page.`,
          variant: "destructive",
        });
      }

      return metrics;
    }

    return null;
  }, [logPerformanceMetric, toast]);

  const measureConnectionLatency = useCallback(async () => {
    try {
      const start = performance.now();
      const { error } = await supabase.from('profiles').select('id').limit(1);
      const latency = performance.now() - start;

      if (!error) {
        if (latency > 5000) { // 5+ seconds
          toast({
            title: "Slow Database Connection",
            description: `Database queries are taking ${(latency / 1000).toFixed(1)}s. Connection may be unstable.`,
            variant: "destructive",
          });
          
          logPerformanceMetric({
            pageLoadTime: 0,
            renderTime: 0,
            connectionLatency: latency
          }, 'high');
        }
        
        return latency;
      }
    } catch (err) {
      console.error('Failed to measure connection latency:', err);
    }
    
    return null;
  }, [logPerformanceMetric, toast]);

  const optimizePerformance = useCallback(() => {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    // Preload critical resources
    const criticalCSSPaths = ['/src/index.css'];
    criticalCSSPaths.forEach(path => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = path;
      link.as = 'style';
      document.head.appendChild(link);
    });

    // Clean up unused event listeners
    return () => {
      imageObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    // Initial performance measurement
    const timeout = setTimeout(() => {
      measurePagePerformance();
      measureConnectionLatency();
    }, 1000); // Wait for page to settle

    // Set up performance monitoring
    const performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'longtask' && entry.duration > 50) {
          console.warn(`Long task detected: ${entry.duration}ms`);
          
          if (entry.duration > 500) { // Very long task
            toast({
              title: "Performance Warning",
              description: `A task took ${entry.duration.toFixed(0)}ms, which may cause the page to freeze.`,
              variant: "destructive",
            });
          }
        }
      });
    });

    try {
      performanceObserver.observe({ entryTypes: ['longtask', 'navigation'] });
    } catch (err) {
      console.log('Performance Observer not supported');
    }

    // Apply performance optimizations
    const cleanup = optimizePerformance();

    return () => {
      clearTimeout(timeout);
      performanceObserver.disconnect();
      cleanup();
    };
  }, [measurePagePerformance, measureConnectionLatency, optimizePerformance, toast]);

  return {
    measurePagePerformance,
    measureConnectionLatency,
    optimizePerformance
  };
};