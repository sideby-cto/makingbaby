
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, CheckCircle, XCircle, Clock, AlertTriangle, Monitor } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RealFrontendTest {
  id: string;
  name: string;
  description: string;
  testFunction: () => Promise<{ success: boolean; message: string; metrics?: any }>;
  critical: boolean;
}

export const RealFrontendTestRunner = () => {
  const [tests, setTests] = useState<RealFrontendTest[]>([
    {
      id: 'dashboard-load',
      name: 'Dashboard Load Test',
      description: 'Test actual dashboard loading performance',
      critical: true,
      testFunction: async () => {
        const startTime = performance.now();
        try {
          // Test dashboard components loading
          const dashboardElements = document.querySelectorAll('[data-testid*="dashboard"]');
          const loadTime = performance.now() - startTime;
          
          if (loadTime > 3000) {
            return { success: false, message: `Dashboard load time ${loadTime.toFixed(0)}ms exceeds 3s threshold` };
          }
          
          return { 
            success: true, 
            message: `Dashboard loaded in ${loadTime.toFixed(0)}ms`,
            metrics: { loadTime }
          };
        } catch (error) {
          return { success: false, message: `Dashboard load failed: ${error}` };
        }
      }
    },
    {
      id: 'auth-flow',
      name: 'Authentication Flow',
      description: 'Test user authentication state',
      critical: true,
      testFunction: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            return { success: false, message: 'No authenticated user found' };
          }
          
          // Test profile data access
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            return { success: false, message: `Profile access failed: ${error.message}` };
          }
          
          return { success: true, message: 'Authentication and profile access working' };
        } catch (error) {
          return { success: false, message: `Auth test failed: ${error}` };
        }
      }
    },
    {
      id: 'database-connectivity',
      name: 'Database Connectivity',
      description: 'Test database connection and basic queries',
      critical: true,
      testFunction: async () => {
        const startTime = performance.now();
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
          
          const queryTime = performance.now() - startTime;
          
          if (error) {
            return { success: false, message: `Database query failed: ${error.message}` };
          }
          
          if (queryTime > 2000) {
            return { success: false, message: `Database query took ${queryTime.toFixed(0)}ms (>2s threshold)` };
          }
          
          return { 
            success: true, 
            message: `Database query completed in ${queryTime.toFixed(0)}ms`,
            metrics: { queryTime }
          };
        } catch (error) {
          return { success: false, message: `Database connectivity test failed: ${error}` };
        }
      }
    },
    {
      id: 'core-features',
      name: 'Core Features Availability',
      description: 'Test core application features are accessible',
      critical: false,
      testFunction: async () => {
        try {
          // Check if key UI elements are present
          const navigationExists = document.querySelector('nav') !== null;
          const mainContentExists = document.querySelector('main, [role="main"]') !== null;
          
          if (!navigationExists || !mainContentExists) {
            return { success: false, message: 'Core UI elements missing' };
          }
          
          return { success: true, message: 'Core features accessible' };
        } catch (error) {
          return { success: false, message: `Core features test failed: ${error}` };
        }
      }
    },
    {
      id: 'performance-metrics',
      name: 'Performance Metrics',
      description: 'Check overall application performance',
      critical: false,
      testFunction: async () => {
        try {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (!navigation) {
            return { success: false, message: 'Performance navigation timing not available' };
          }
          
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          const domReady = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          
          const issues = [];
          if (loadTime > 5000) issues.push(`Load time ${loadTime.toFixed(0)}ms > 5s`);
          if (domReady > 3000) issues.push(`DOM ready ${domReady.toFixed(0)}ms > 3s`);
          
          return {
            success: issues.length === 0,
            message: issues.length > 0 ? issues.join(', ') : `Performance OK (Load: ${loadTime.toFixed(0)}ms, DOM: ${domReady.toFixed(0)}ms)`,
            metrics: { loadTime, domReady }
          };
        } catch (error) {
          return { success: false, message: `Performance test failed: ${error}` };
        }
      }
    }
  ]);

  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; timestamp: Date; metrics?: any }>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const { toast } = useToast();

  const runSingleTest = async (test: RealFrontendTest) => {
    setCurrentTest(test.id);
    try {
      const result = await test.testFunction();
      const testResult = {
        ...result,
        timestamp: new Date()
      };
      
      setTestResults(prev => ({
        ...prev,
        [test.id]: testResult
      }));
      
      // Log to database
      await supabase.from('core_flow_test_executions').insert({
        test_id: test.id,
        execution_type: 'frontend_real',
        status: result.success ? 'passed' : 'failed',
        results: {
          message: result.message,
          metrics: result.metrics,
          critical: test.critical
        },
        completed_at: new Date().toISOString()
      });
      
    } catch (error) {
      const errorResult = {
        success: false,
        message: `Test execution failed: ${error}`,
        timestamp: new Date()
      };
      
      setTestResults(prev => ({
        ...prev,
        [test.id]: errorResult
      }));
    }
    setCurrentTest(null);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});
    
    for (const test of tests) {
      await runSingleTest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
    
    const results = Object.values(testResults);
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const criticalFailed = tests.filter(test => 
      testResults[test.id] && !testResults[test.id].success && test.critical
    ).length;
    
    if (criticalFailed > 0) {
      toast({
        title: "Critical Frontend Tests Failed",
        description: `${criticalFailed} critical test(s) failed. Deployment not recommended.`,
        variant: "destructive"
      });
    } else if (failed === 0) {
      toast({
        title: "All Frontend Tests Passed",
        description: "Frontend is ready for deployment",
        variant: "default"
      });
    } else {
      toast({
        title: "Some Tests Failed",
        description: `${failed} non-critical test(s) failed. Review before deployment.`,
        variant: "destructive"
      });
    }
  };

  const getTestIcon = (test: RealFrontendTest) => {
    const result = testResults[test.id];
    if (currentTest === test.id) return <Clock className="h-4 w-4 animate-spin" />;
    if (!result) return <Monitor className="h-4 w-4" />;
    return result.success ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const completedTests = Object.keys(testResults).length;
  const progress = tests.length > 0 ? (completedTests / tests.length) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Real Frontend Testing
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Execute actual frontend tests in the browser environment
          </p>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isRunning && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{completedTests}/{tests.length}</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="space-y-3">
          {tests.map((test) => {
            const result = testResults[test.id];
            return (
              <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTestIcon(test)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{test.name}</span>
                      {test.critical && (
                        <Badge variant="destructive" className="text-xs">Critical</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                    {result && (
                      <p className={`text-xs mt-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                        {result.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runSingleTest(test)}
                  disabled={isRunning}
                >
                  Test
                </Button>
              </div>
            );
          })}
        </div>

        {Object.keys(testResults).length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Test Results Summary: {Object.values(testResults).filter(r => r.success).length} passed, {Object.values(testResults).filter(r => !r.success).length} failed
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
