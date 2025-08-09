import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface SignupMetrics {
  totalSignups: number;
  successfulSignups: number;
  failedSignups: number;
  averageSignupTime: number;
  commonFailurePoints: Array<{
    step: string;
    count: number;
    percentage: number;
  }>;
  upduoIntegrationHealth: {
    totalQueued: number;
    completed: number;
    failed: number;
    pending: number;
    processing: number;
  };
}

interface SignupHealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  issues: string[];
  recommendations: string[];
}

export const useSignupMetrics = () => {
  const [metrics, setMetrics] = useState<SignupMetrics | null>(null);
  const [healthStatus, setHealthStatus] = useState<SignupHealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSignupMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get signup transaction logs (if table exists)
      let signupLogs = [];
      try {
        const { data, error: logsError } = await supabase
          .from('signup_transaction_logs' as any)
          .select('*')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
          .order('created_at', { ascending: false });

        if (!logsError) {
          signupLogs = data || [];
        }
      } catch (e) {
        console.warn('Signup logs table not available yet');
      }

      // Get Upduo queue status (if table exists)
      let queueStatus = {
        totalQueued: 0,
        completed: 0,
        failed: 0,
        pending: 0,
        processing: 0
      };

      try {
        const { data: queueData, error: queueError } = await supabase
          .from('upduo_integration_queue' as any)
          .select('status')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (!queueError && queueData) {
          queueStatus.totalQueued = queueData.length;
          queueStatus.completed = queueData.filter((item: any) => item.status === 'completed').length;
          queueStatus.failed = queueData.filter((item: any) => item.status === 'failed').length;
          queueStatus.pending = queueData.filter((item: any) => item.status === 'pending').length;
          queueStatus.processing = queueData.filter((item: any) => item.status === 'processing').length;
        }
      } catch (e) {
        console.warn('Upduo queue table not available yet');
      }

      // Calculate metrics from signup logs
      const transactionIds = [...new Set(signupLogs.map((log: any) => log.transaction_id))];
      const completedTransactions = transactionIds.filter(txId => 
        signupLogs.some((log: any) => 
          log.transaction_id === txId && 
          log.step === 'profile_creation' && 
          log.status === 'completed'
        )
      );

      const failedTransactions = transactionIds.filter(txId => 
        signupLogs.some((log: any) => 
          log.transaction_id === txId && 
          log.status === 'failed'
        ) && !completedTransactions.includes(txId)
      );

      // Calculate average signup time from completed transactions
      const signupTimes = completedTransactions.map(txId => {
        const logs = signupLogs.filter((log: any) => log.transaction_id === txId);
        const startTime = Math.min(...logs.map((log: any) => new Date(log.created_at).getTime()));
        const endTime = Math.max(...logs.map((log: any) => new Date(log.created_at).getTime()));
        return endTime - startTime;
      });

      const averageSignupTime = signupTimes.length > 0 
        ? signupTimes.reduce((a, b) => a + b, 0) / signupTimes.length 
        : 0;

      // Analyze common failure points
      const failureLogs = signupLogs.filter((log: any) => log.status === 'failed');
      const failureSteps = failureLogs.reduce((acc: any, log: any) => {
        acc[log.step] = (acc[log.step] || 0) + 1;
        return acc;
      }, {});

      const commonFailurePoints = Object.entries(failureSteps)
        .map(([step, count]: [string, any]) => ({
          step,
          count,
          percentage: (count / failureLogs.length) * 100
        }))
        .sort((a, b) => b.count - a.count);

      const newMetrics: SignupMetrics = {
        totalSignups: transactionIds.length,
        successfulSignups: completedTransactions.length,
        failedSignups: failedTransactions.length,
        averageSignupTime,
        commonFailurePoints,
        upduoIntegrationHealth: queueStatus
      };

      // Assess health status
      const successRate = newMetrics.totalSignups > 0 
        ? (newMetrics.successfulSignups / newMetrics.totalSignups) * 100 
        : 100;

      const upduoHealthRate = queueStatus.totalQueued > 0
        ? (queueStatus.completed / queueStatus.totalQueued) * 100
        : 100;

      let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
      const issues: string[] = [];
      const recommendations: string[] = [];

      if (successRate < 50) {
        status = 'critical';
        issues.push(`Critical: Signup success rate is ${successRate.toFixed(1)}%`);
        recommendations.push('Investigate signup flow immediately');
      } else if (successRate < 80) {
        status = 'degraded';
        issues.push(`Warning: Signup success rate is ${successRate.toFixed(1)}%`);
        recommendations.push('Review common failure points');
      }

      if (upduoHealthRate < 70 && queueStatus.totalQueued > 0) {
        if (status !== 'critical') status = 'degraded';
        issues.push(`Upduo integration health is ${upduoHealthRate.toFixed(1)}%`);
        recommendations.push('Check Upduo integration queue processing');
      }

      if (newMetrics.averageSignupTime > 10000) { // > 10 seconds
        if (status !== 'critical') status = 'degraded';
        issues.push(`Slow signup performance: ${(newMetrics.averageSignupTime / 1000).toFixed(1)}s average`);
        recommendations.push('Optimize signup performance');
      }

      if (queueStatus.pending > 50) {
        if (status !== 'critical') status = 'degraded';
        issues.push(`High number of pending Upduo integrations: ${queueStatus.pending}`);
        recommendations.push('Increase queue processing frequency');
      }

      setMetrics(newMetrics);
      setHealthStatus({ status, issues, recommendations });

    } catch (err: any) {
      console.error('Failed to fetch signup metrics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch metrics on mount and every 5 minutes
  useEffect(() => {
    fetchSignupMetrics();
    const interval = setInterval(fetchSignupMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSignupMetrics]);

  return {
    metrics,
    healthStatus,
    loading,
    error,
    refetch: fetchSignupMetrics
  };
};