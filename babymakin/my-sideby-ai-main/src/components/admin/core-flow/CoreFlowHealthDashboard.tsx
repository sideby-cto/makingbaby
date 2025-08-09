import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, XCircle, Clock, Activity, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TestExecution {
  id: string;
  test_id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  results: any;
  error_message?: string;
  core_flow_tests?: {
    test_name: string;
    test_type: string;
    critical: boolean;
  };
}

export const CoreFlowHealthDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch recent test executions
  const { data: executions, isLoading: executionsLoading, refetch: refetchExecutions } = useQuery({
    queryKey: ['core-flow-test-executions', refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('core_flow_test_executions')
        .select(`
          *,
          core_flow_tests (
            test_name,
            test_type,
            critical
          )
        `)
        .order('started_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as TestExecution[];
    }
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchExecutions();
  };

  // Calculate overall health score based on recent test results
  const calculateHealthScore = () => {
    if (!executions || executions.length === 0) return 0;
    
    const recentTests = executions.slice(0, 20);
    const passedTests = recentTests.filter(e => e.status === 'passed').length;
    
    return Math.round((passedTests / recentTests.length) * 100);
  };

  // Get test results summary
  const getTestResultsSummary = () => {
    if (!executions) return { total: 0, passed: 0, failed: 0, critical_failed: 0 };
    
    const recentTests = executions.slice(0, 20);
    const passed = recentTests.filter(e => e.status === 'passed').length;
    const failed = recentTests.filter(e => e.status === 'failed').length;
    const criticalFailed = recentTests.filter(e => 
      e.status === 'failed' && e.core_flow_tests?.critical
    ).length;
    
    return {
      total: recentTests.length,
      passed,
      failed,
      critical_failed: criticalFailed
    };
  };

  // Get test type summary
  const getTestTypeSummary = () => {
    if (!executions) return {};
    
    const summary: Record<string, { total: number; passed: number; failed: number }> = {};
    
    executions.slice(0, 50).forEach(execution => {
      const testType = execution.core_flow_tests?.test_type || 'unknown';
      if (!summary[testType]) {
        summary[testType] = { total: 0, passed: 0, failed: 0 };
      }
      
      summary[testType].total++;
      if (execution.status === 'passed') summary[testType].passed++;
      if (execution.status === 'failed') summary[testType].failed++;
    });
    
    return summary;
  };

  const healthScore = calculateHealthScore();
  const testSummary = getTestResultsSummary();
  const testTypeSummary = getTestTypeSummary();

  if (executionsLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Core Flow Health Dashboard</h2>
          <p className="text-muted-foreground">Real-time monitoring of critical test flows</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Overall System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold">{healthScore}%</span>
                {healthScore >= 95 ? (
                  <Badge variant="default" className="bg-green-500">Excellent</Badge>
                ) : healthScore >= 90 ? (
                  <Badge variant="secondary">Good</Badge>
                ) : (
                  <Badge variant="destructive">Needs Attention</Badge>
                )}
              </div>
              <Progress value={healthScore} className="w-full" />
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Recent Tests</div>
              <div className="text-lg font-semibold">
                {testSummary.passed}/{testSummary.total}
              </div>
              {testSummary.critical_failed > 0 && (
                <div className="text-red-500 text-sm">
                  {testSummary.critical_failed} critical failures
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Type Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(testTypeSummary).map(([type, summary]) => {
          const successRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;
          
          return (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {type.replace('_', ' ')} Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {successRate >= 95 && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {successRate >= 80 && successRate < 95 && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                  {successRate < 80 && <XCircle className="w-5 h-5 text-red-500" />}
                  {summary.total === 0 && <Clock className="w-5 h-5 text-gray-400" />}
                  
                  <div className="flex-1">
                    <div className="text-lg font-semibold">
                      {summary.total === 0 ? 'No Data' : `${Math.round(successRate)}%`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {summary.passed}/{summary.total} passed
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Results</CardTitle>
          <CardDescription>Latest test executions and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {executions?.slice(0, 10).map((execution) => (
              <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {execution.status === 'passed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {execution.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                  {execution.status === 'running' && <Clock className="w-4 h-4 text-blue-500 animate-spin" />}
                  
                  <div>
                    <div className="font-medium">
                      {execution.core_flow_tests?.test_name || 'Unknown Test'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(execution.started_at).toLocaleString()}
                      {execution.duration_ms && ` • ${execution.duration_ms}ms`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {execution.core_flow_tests?.critical && (
                    <Badge variant="destructive">Critical</Badge>
                  )}
                  <Badge variant="outline">
                    {execution.core_flow_tests?.test_type || 'unknown'}
                  </Badge>
                  <Badge variant={execution.status === 'passed' ? 'default' : 'destructive'}>
                    {execution.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};