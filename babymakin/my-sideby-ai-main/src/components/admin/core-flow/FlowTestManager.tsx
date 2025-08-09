
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Play, Square, Clock, CheckCircle, XCircle, AlertTriangle, Plus, Settings } from 'lucide-react';
import { FrontendTestRunner } from './FrontendTestRunner';
import { RealLoadTestManager } from './RealLoadTestManager';

interface CoreFlowTest {
  id: string;
  test_name: string;
  test_type: string;
  description?: string;
  test_script: any;
  enabled: boolean;
  critical: boolean;
  created_at: string;
  updated_at: string;
}

interface CoreFlowTestBasic {
  test_name: string;
  test_type: string;
  critical: boolean;
}

interface TestExecution {
  id: string;
  test_id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  results?: any;
  error_message?: string;
}

export const FlowTestManager = () => {
  const [activeTab, setActiveTab] = useState('tests');
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tests
  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ['core-flow-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('core_flow_tests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CoreFlowTest[];
    }
  });

  // Fetch recent executions
  const { data: executions, isLoading: executionsLoading } = useQuery({
    queryKey: ['core-flow-test-executions'],
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
      return data as (TestExecution & { core_flow_tests: CoreFlowTestBasic })[];
    }
  });

  // Run test mutation
  const runTestMutation = useMutation({
    mutationFn: async ({ testId, executionType }: { testId: string; executionType: string }) => {
      // Call the edge function to run the test
      const { data, error } = await supabase.functions.invoke('run-core-flow-tests', {
        body: { 
          testIds: [testId],
          executionType 
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['core-flow-test-executions'] });
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.testId);
        return newSet;
      });
      
      toast({
        title: "Test Completed",
        description: "Test execution has finished. Check the results below."
      });
    },
    onError: (error, variables) => {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.testId);
        return newSet;
      });
      
      toast({
        title: "Test Failed",
        description: `Failed to run test: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Run all tests mutation
  const runAllTestsMutation = useMutation({
    mutationFn: async () => {
      const enabledTests = tests?.filter(t => t.enabled) || [];
      
      const { data, error } = await supabase.functions.invoke('run-core-flow-tests', {
        body: { 
          testIds: enabledTests.map(t => t.id),
          executionType: 'manual'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core-flow-test-executions'] });
      setRunningTests(new Set());
      
      toast({
        title: "All Tests Completed",
        description: "All enabled tests have been executed."
      });
    }
  });

  const handleRunTest = (testId: string) => {
    setRunningTests(prev => new Set(prev).add(testId));
    runTestMutation.mutate({ testId, executionType: 'manual' });
  };

  const handleRunAllTests = () => {
    const enabledTests = tests?.filter(t => t.enabled) || [];
    enabledTests.forEach(test => {
      setRunningTests(prev => new Set(prev).add(test.id));
    });
    runAllTestsMutation.mutate();
  };

  const getTestStatus = (testId: string) => {
    if (!executions) return 'unknown';
    
    const testExecutions = executions.filter(e => e.test_id === testId);
    if (testExecutions.length === 0) return 'never_run';
    
    const latest = testExecutions[0];
    return latest.status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'never_run':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      running: 'secondary',
      never_run: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status === 'never_run' ? 'Not Run' : status}
      </Badge>
    );
  };

  const getCriticalFailures = () => {
    if (!executions) return [];
    
    return executions.filter(e => 
      e.status === 'failed' && 
      e.core_flow_tests?.critical &&
      new Date(e.started_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );
  };

  const criticalFailures = getCriticalFailures();

  if (testsLoading || executionsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-80 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Critical Failures Alert */}
      {criticalFailures.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {criticalFailures.length} critical test(s) have failed in the last 24 hours. 
            These failures may block deployments and require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Flow Test Management</h3>
          <p className="text-muted-foreground">Manage and execute end-to-end flow tests</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRunAllTests} 
            disabled={runAllTestsMutation.isPending}
            className="bg-primary"
          >
            <Play className="w-4 h-4 mr-2" />
            Run All Tests
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tests">Backend Tests</TabsTrigger>
          <TabsTrigger value="frontend">Frontend Tests</TabsTrigger>
          <TabsTrigger value="load">Load Tests</TabsTrigger>
          <TabsTrigger value="executions">Recent Results</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <div className="grid gap-4">
            {tests?.map((test) => {
              const status = getTestStatus(test.id);
              const isRunning = runningTests.has(test.id);
              
              return (
                <Card key={test.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(isRunning ? 'running' : status)}
                        <div>
                          <CardTitle className="text-lg">{test.test_name}</CardTitle>
                          <CardDescription>
                            {test.description} • Type: {test.test_type}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.critical && (
                          <Badge variant="destructive">Critical</Badge>
                        )}
                        {getStatusBadge(isRunning ? 'running' : status)}
                        {!test.enabled && (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Last updated: {new Date(test.updated_at).toLocaleString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRunTest(test.id)}
                          disabled={isRunning || !test.enabled}
                        >
                          {isRunning ? (
                            <>
                              <Square className="w-4 h-4 mr-2" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Run Test
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="frontend">
          <FrontendTestRunner />
        </TabsContent>

        <TabsContent value="load">
          <RealLoadTestManager />
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          {executions?.slice(0, 20).map((execution) => (
            <Card key={execution.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <CardTitle className="text-lg">
                        {execution.core_flow_tests?.test_name || 'Unknown Test'}
                      </CardTitle>
                      <CardDescription>
                        Started: {new Date(execution.started_at).toLocaleString()}
                        {execution.completed_at && (
                          <> • Duration: {execution.duration_ms}ms</>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {execution.core_flow_tests?.critical && (
                      <Badge variant="destructive">Critical</Badge>
                    )}
                    <Badge variant="outline">Manual</Badge>
                    {getStatusBadge(execution.status)}
                  </div>
                </div>
              </CardHeader>
              {(execution.error_message || execution.results) && (
                <CardContent>
                  {execution.error_message && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                      <div className="text-red-800 text-sm font-medium">Error</div>
                      <div className="text-red-700 text-sm">{execution.error_message}</div>
                    </div>
                  )}
                  {execution.results && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                      <div className="text-gray-800 text-sm font-medium">Results</div>
                      <pre className="text-gray-700 text-xs mt-1 overflow-x-auto">
                        {JSON.stringify(execution.results, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
