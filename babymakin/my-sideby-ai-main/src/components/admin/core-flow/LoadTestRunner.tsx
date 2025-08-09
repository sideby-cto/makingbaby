
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Zap, TrendingUp, Users, Database, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LoadTestConfig {
  name: string;
  description: string;
  virtualUsers: number;
  duration: number; // seconds
  rampUp: number; // seconds
}

interface LoadTestResult {
  timestamp: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

export const LoadTestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<LoadTestConfig | null>(null);
  const [testResults, setTestResults] = useState<LoadTestResult[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const testConfigs: LoadTestConfig[] = [
    {
      name: 'Light Load',
      description: 'Simulate 10 concurrent users',
      virtualUsers: 10,
      duration: 30,
      rampUp: 5
    },
    {
      name: 'Medium Load',
      description: 'Simulate 25 concurrent users',
      virtualUsers: 25,
      duration: 60,
      rampUp: 10
    },
    {
      name: 'Heavy Load',
      description: 'Simulate 50 concurrent users',
      virtualUsers: 50,
      duration: 90,
      rampUp: 15
    }
  ];

  const simulateUserAction = async (): Promise<LoadTestResult> => {
    const startTime = performance.now();
    
    try {
      // Simulate typical user actions
      const actions = [
        () => supabase.from('profiles').select('count').limit(1),
        () => supabase.auth.getUser(),
        () => supabase.from('core_flow_test_executions').select('*').limit(5),
      ];
      
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      await randomAction();
      
      const responseTime = performance.now() - startTime;
      
      return {
        timestamp: Date.now(),
        responseTime,
        success: true
      };
    } catch (error) {
      return {
        timestamp: Date.now(),
        responseTime: performance.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runLoadTest = async (config: LoadTestConfig) => {
    setIsRunning(true);
    setCurrentTest(config);
    setTestResults([]);
    setProgress(0);

    const results: LoadTestResult[] = [];
    const totalRequests = config.virtualUsers * (config.duration / 2); // Rough estimate
    let completedRequests = 0;

    try {
      // Simulate concurrent users with ramp-up
      const userPromises: Promise<void>[] = [];
      
      for (let user = 0; user < config.virtualUsers; user++) {
        const userPromise = (async () => {
          // Ramp-up delay
          await new Promise(resolve => setTimeout(resolve, (user / config.virtualUsers) * config.rampUp * 1000));
          
          const endTime = Date.now() + (config.duration * 1000);
          
          while (Date.now() < endTime && isRunning) {
            const result = await simulateUserAction();
            results.push(result);
            completedRequests++;
            setProgress((completedRequests / totalRequests) * 100);
            
            // Random delay between requests (0.5-2 seconds)
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));
          }
        })();
        
        userPromises.push(userPromise);
      }

      await Promise.all(userPromises);
      
      // Analyze results
      const successRate = (results.filter(r => r.success).length / results.length) * 100;
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
      const maxResponseTime = Math.max(...results.map(r => r.responseTime));
      const minResponseTime = Math.min(...results.map(r => r.responseTime));
      
      // Store results in database
      await supabase.from('core_flow_test_executions').insert({
        test_id: `load-test-${config.name.toLowerCase().replace(/\s+/g, '-')}`,
        execution_type: 'load_test',
        status: successRate > 95 ? 'passed' : 'failed',
        results: {
          config: {
            name: config.name,
            description: config.description,
            virtualUsers: config.virtualUsers,
            duration: config.duration,
            rampUp: config.rampUp
          },
          totalRequests: results.length,
          successRate,
          avgResponseTime,
          maxResponseTime,
          minResponseTime,
          errors: results.filter(r => !r.success).map(r => r.error)
        } as any,
        completed_at: new Date().toISOString()
      });

      toast({
        title: "Load Test Completed",
        description: `Success Rate: ${successRate.toFixed(1)}%, Avg Response: ${avgResponseTime.toFixed(0)}ms`,
        variant: successRate > 95 ? "default" : "destructive"
      });

    } catch (error) {
      toast({
        title: "Load Test Failed",
        description: `Test execution failed: ${error}`,
        variant: "destructive"
      });
    } finally {
      setTestResults(results);
      setIsRunning(false);
      setCurrentTest(null);
      setProgress(0);
    }
  };

  const stopTest = () => {
    setIsRunning(false);
  };

  // Prepare chart data
  const chartData = testResults
    .slice(-50) // Last 50 data points
    .map((result, index) => ({
      request: index + 1,
      responseTime: result.responseTime,
      success: result.success ? 1 : 0
    }));

  const avgResponseTime = testResults.length > 0 
    ? testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length 
    : 0;
  
  const successRate = testResults.length > 0
    ? (testResults.filter(r => r.success).length / testResults.length) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Load Testing
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test system performance under various load conditions
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Configuration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testConfigs.map((config) => (
            <Card key={config.name} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{config.name}</h4>
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {config.virtualUsers}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {config.description}
              </p>
              <div className="text-xs text-muted-foreground mb-3">
                Duration: {config.duration}s | Ramp-up: {config.rampUp}s
              </div>
              <Button 
                onClick={() => runLoadTest(config)}
                disabled={isRunning}
                className="w-full"
                size="sm"
              >
                {currentTest?.name === config.name ? 'Running...' : 'Start Test'}
              </Button>
            </Card>
          ))}
        </div>

        {/* Progress and Controls */}
        {isRunning && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Running: {currentTest?.name}
              </span>
              <Button variant="outline" onClick={stopTest} size="sm">
                Stop Test
              </Button>
            </div>
            <Progress value={progress} />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{testResults.length}</div>
                <div className="text-xs text-muted-foreground">Requests</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</div>
                <div className="text-xs text-muted-foreground">Avg Response</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Results Chart */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Response Time Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="request" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'responseTime' ? `${value}ms` : value,
                        name === 'responseTime' ? 'Response Time' : 'Success'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        {testResults.length > 0 && (
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Load Test Results: {testResults.length} requests completed with {successRate.toFixed(1)}% success rate and {avgResponseTime.toFixed(0)}ms average response time.
              {successRate < 95 && (
                <span className="text-destructive font-medium"> Performance issues detected!</span>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
