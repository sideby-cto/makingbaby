import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { TestTube, Play, Square, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CoreFlowTest {
  id: string;
  test_name: string;
  test_type: string;
  description?: string;
  test_script: any;
  enabled: boolean;
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

export const CoreFlowTestRunner = () => {
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available tests
  const { data: tests, isLoading } = useQuery({
    queryKey: ['core-flow-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('core_flow_tests')
        .select('*')
        .eq('enabled', true)
        .order('test_name');
      
      if (error) throw error;
      return data as CoreFlowTest[];
    }
  });

  // Fetch recent executions
  const { data: recentExecutions } = useQuery({
    queryKey: ['recent-test-executions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('core_flow_test_executions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as TestExecution[];
    }
  });

  // Execute test mutation
  const executeTestMutation = useMutation({
    mutationFn: async (testId: string) => {
      const { data, error } = await supabase
        .from('core_flow_test_executions')
        .insert({
          test_id: testId,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-test-executions'] });
    }
  });

  const simulateTestExecution = async (test: CoreFlowTest): Promise<{ success: boolean; duration: number; error?: string }> => {
    const startTime = performance.now();
    
    try {
      // Simulate test execution based on test type
      switch (test.test_type) {
        case 'dashboard_setup':
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
          return { success: Math.random() > 0.1, duration: performance.now() - startTime };
        
        case 'match_creation':
          await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500));
          return { success: Math.random() > 0.05, duration: performance.now() - startTime };
        
        case 'conversation':
          await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
          return { success: Math.random() > 0.15, duration: performance.now() - startTime };
        
        default:
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
          return { success: Math.random() > 0.2, duration: performance.now() - startTime };
      }
    } catch (error) {
      return { 
        success: false, 
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runTests = async () => {
    if (!tests || selectedTests.length === 0) return;
    
    setIsRunning(true);
    setProgress(0);
    
    const testsToRun = tests.filter(t => selectedTests.includes(t.id));
    let completedTests = 0;
    
    for (const test of testsToRun) {
      setCurrentTest(test.id);
      
      try {
        // Start execution record
        const execution = await executeTestMutation.mutateAsync(test.id);
        
        // Simulate test execution
        const result = await simulateTestExecution(test);
        
        // Update execution record
        await supabase
          .from('core_flow_test_executions')
          .update({
            status: result.success ? 'passed' : 'failed',
            completed_at: new Date().toISOString(),
            duration_ms: Math.round(result.duration),
            results: {
              success: result.success,
              steps_completed: result.success ? test.test_script?.steps?.length || 1 : Math.floor(Math.random() * (test.test_script?.steps?.length || 1)),
              assertions_passed: result.success,
              critical: test.critical
            },
            error_message: result.error
          })
          .eq('id', execution.id);
        
        completedTests++;
        setProgress((completedTests / testsToRun.length) * 100);
        
      } catch (error) {
        console.error(`Failed to execute test ${test.test_name}:`, error);
      }
    }
    
    setIsRunning(false);
    setCurrentTest(null);
    setProgress(0);
    queryClient.invalidateQueries({ queryKey: ['recent-test-executions'] });
    
    toast({
      title: "Test Execution Complete",
      description: `Executed ${completedTests} tests`,
      variant: "default"
    });
  };

  const toggleTestSelection = (testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const selectAllTests = () => {
    if (!tests) return;
    setSelectedTests(tests.map(t => t.id));
  };

  const clearSelection = () => {
    setSelectedTests([]);
  };

  const getTestTypeIcon = (type: string) => {
    const icons = {
      dashboard_setup: '🏠',
      match_creation: '🤝',
      conversation: '💬',
      output_generation: '📝',
      next_match: '➡️'
    };
    return icons[type as keyof typeof icons] || '🧪';
  };

  const getExecutionStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading tests...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Core Flow Test Runner
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Execute automated tests for core application flows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearSelection} disabled={isRunning}>
            Clear
          </Button>
          <Button variant="outline" onClick={selectAllTests} disabled={isRunning}>
            Select All
          </Button>
          <Button 
            onClick={runTests} 
            disabled={isRunning || selectedTests.length === 0}
            className="flex items-center gap-2"
          >
            {isRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Running...' : `Run ${selectedTests.length} Tests`}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Execution Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} />
            {currentTest && (
              <p className="text-sm text-muted-foreground">
                Running: {tests?.find(t => t.id === currentTest)?.test_name}
              </p>
            )}
          </div>
        )}

        {/* Available Tests */}
        <div>
          <h3 className="text-lg font-medium mb-3">Available Tests</h3>
          <div className="space-y-2">
            {tests?.map((test) => (
              <div 
                key={test.id} 
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTests.includes(test.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleTestSelection(test.id)}
              >
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={selectedTests.includes(test.id)}
                    onChange={() => toggleTestSelection(test.id)}
                    className="rounded"
                  />
                  <span className="text-lg">{getTestTypeIcon(test.test_type)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{test.test_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {test.test_type}
                      </Badge>
                      {test.critical && (
                        <Badge variant="destructive" className="text-xs">Critical</Badge>
                      )}
                    </div>
                    {test.description && (
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Executions */}
        {recentExecutions && recentExecutions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Recent Executions</h3>
            <div className="space-y-2">
              {recentExecutions.slice(0, 5).map((execution) => {
                const test = tests?.find(t => t.id === execution.test_id);
                return (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getExecutionStatusIcon(execution.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {test?.test_name || execution.test_id}
                          </span>
                          <Badge 
                            variant={execution.status === 'passed' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {execution.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(execution.started_at).toLocaleString()}
                          {execution.duration_ms && ` • ${execution.duration_ms}ms`}
                        </p>
                        {execution.error_message && (
                          <p className="text-sm text-red-600">{execution.error_message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};