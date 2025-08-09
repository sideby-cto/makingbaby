import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseMetrics {
  queryCount: number;
  avgResponseTime: number;
  errorCount: number;
  timeoutCount: number;
  lastError: string | null;
  lastTimeout: Date | null;
}

interface QueryLog {
  operation: string;
  startTime: number;
  endTime?: number;
  success: boolean;
  error?: string;
  timeout?: boolean;
}

export const useDatabaseMonitoring = () => {
  const [metrics, setMetrics] = useState<DatabaseMetrics>({
    queryCount: 0,
    avgResponseTime: 0,
    errorCount: 0,
    timeoutCount: 0,
    lastError: null,
    lastTimeout: null
  });

  const [queryLogs, setQueryLogs] = useState<QueryLog[]>([]);

  const logQuery = useCallback((operation: string) => {
    const startTime = Date.now();
    const queryId = Math.random().toString(36).substr(2, 9);

    setQueryLogs(prev => [...prev.slice(-99), { // Keep last 100 logs
      operation,
      startTime,
      success: false
    }]);

    return {
      success: (responseTime?: number) => {
        const endTime = responseTime || Date.now();
        setQueryLogs(prev => prev.map(log => 
          log.startTime === startTime 
            ? { ...log, endTime, success: true }
            : log
        ));
        
        setMetrics(prev => {
          const newQueryCount = prev.queryCount + 1;
          const responseTimeMs = endTime - startTime;
          const newAvgResponseTime = ((prev.avgResponseTime * (newQueryCount - 1)) + responseTimeMs) / newQueryCount;
          
          return {
            ...prev,
            queryCount: newQueryCount,
            avgResponseTime: newAvgResponseTime
          };
        });
      },
      error: (error: string, isTimeout = false) => {
        const endTime = Date.now();
        setQueryLogs(prev => prev.map(log => 
          log.startTime === startTime 
            ? { ...log, endTime, success: false, error, timeout: isTimeout }
            : log
        ));

        setMetrics(prev => ({
          ...prev,
          queryCount: prev.queryCount + 1,
          errorCount: prev.errorCount + 1,
          timeoutCount: isTimeout ? prev.timeoutCount + 1 : prev.timeoutCount,
          lastError: error,
          lastTimeout: isTimeout ? new Date() : prev.lastTimeout
        }));
      }
    };
  }, []);

  const getHealthStatus = useCallback(() => {
    const { errorCount, queryCount, avgResponseTime, timeoutCount } = metrics;
    const errorRate = queryCount > 0 ? (errorCount / queryCount) * 100 : 0;
    const timeoutRate = queryCount > 0 ? (timeoutCount / queryCount) * 100 : 0;

    if (timeoutRate > 20 || errorRate > 50 || avgResponseTime > 10000) {
      return 'critical';
    } else if (timeoutRate > 10 || errorRate > 25 || avgResponseTime > 5000) {
      return 'warning';
    } else if (timeoutRate > 5 || errorRate > 10 || avgResponseTime > 2000) {
      return 'degraded';
    }
    return 'healthy';
  }, [metrics]);

  const getRecommendations = useCallback(() => {
    const healthStatus = getHealthStatus();
    const recommendations: string[] = [];

    if (healthStatus === 'critical' || healthStatus === 'warning') {
      if (metrics.timeoutCount > 0) {
        recommendations.push('Consider implementing connection pooling');
        recommendations.push('Reduce query complexity or add database indexes');
      }
      
      if (metrics.avgResponseTime > 5000) {
        recommendations.push('Optimize database queries');
        recommendations.push('Consider caching frequently accessed data');
      }

      if (metrics.errorCount > metrics.queryCount * 0.3) {
        recommendations.push('Review error logs for recurring issues');
        recommendations.push('Implement circuit breaker pattern');
      }
    }

    return recommendations;
  }, [metrics, getHealthStatus]);

  const resetMetrics = useCallback(() => {
    setMetrics({
      queryCount: 0,
      avgResponseTime: 0,
      errorCount: 0,
      timeoutCount: 0,
      lastError: null,
      lastTimeout: null
    });
    setQueryLogs([]);
  }, []);

  // Periodically clean up old logs
  useEffect(() => {
    const cleanup = setInterval(() => {
      setQueryLogs(prev => prev.slice(-50)); // Keep only last 50 logs
    }, 60000); // Every minute

    return () => clearInterval(cleanup);
  }, []);

  return {
    metrics,
    queryLogs: queryLogs.slice(-10), // Return last 10 for display
    healthStatus: getHealthStatus(),
    recommendations: getRecommendations(),
    logQuery,
    resetMetrics
  };
};