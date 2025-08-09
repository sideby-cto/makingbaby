import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, Users, Zap, TrendingUp, AlertTriangle, Activity, Database, StopCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LoadTestConfig {
  id?: string;
  name: string;
  target_url: string;
  virtual_users: number;
  duration_seconds: number;
  ramp_up_seconds: number;
  test_scenario: any;
  headers?: Record<string, string>;
}

interface LoadTestExecution {
  id: string;
  configuration_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time?: number;
  min_response_time?: number;
  max_response_time?: number;
  requests_per_second?: number;
  error_rate?: number;
  results_data?: any;
  error_details?: any[];
}

interface LoadTestMetric {
  id: string;
  execution_id: string;
  timestamp_recorded: string;
  active_users: number;
  requests_per_second?: number;
  response_time?: number;
  error_count: number;
}

export const RealLoadTestManager = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<LoadTestExecution | null>(null);
  const [executions, setExecutions] = useState<LoadTestExecution[]>([]);
  const [realtimeMetrics, setRealtimeMetrics] = useState<LoadTestMetric[]>([]);
  const [customConfig, setCustomConfig] = useState<LoadTestConfig>({
    name: '',
    target_url: '/dashboard',
    virtual_users: 10,
    duration_seconds: 60,
    ramp_up_seconds: 10,
    test_scenario: {},
    headers: {}
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Predefined test configurations
  const predefinedConfigs: LoadTestConfig[] = [
    {
      name: 'Dashboard Light Load',
      target_url: '/dashboard',
      virtual_users: 10,
      duration_seconds: 60,
      ramp_up_seconds: 10,
      test_scenario: { type: 'user_simulation' }
    },
    {
      name: 'Dashboard Heavy Load',
      target_url: '/dashboard',
      virtual_users: 50,
      duration_seconds: 300,
      ramp_up_seconds: 30,
      test_scenario: { type: 'stress_test' }
    },
    {
      name: 'API Endpoint Test',
      target_url: '/api/health',
      virtual_users: 25,
      duration_seconds: 120,
      ramp_up_seconds: 20,
      test_scenario: { type: 'api_test' }
    }
  ];

  // Fetch recent executions
  useEffect(() => {
    fetchExecutions();
  }, []);

  // Poll for updates when a test is running
  useEffect(() => {
    if (!currentExecution) return;

    const interval = setInterval(async () => {
      await fetchExecutionStatus(currentExecution.id);
      await fetchRealtimeMetrics(currentExecution.id);
    }, 2000);

    return () => clearInterval(interval);
  }, [currentExecution]);

  const fetchExecutions = async () => {
    try {
      const { data, error } = await supabase
        .from('load_test_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setExecutions((data || []) as LoadTestExecution[]);
    } catch (error) {
      console.error('Error fetching executions:', error);
    }
  };

  const fetchExecutionStatus = async (executionId: string) => {
    try {
      const { data, error } = await supabase
        .from('load_test_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (error) throw error;
      
      if (data) {
        setCurrentExecution(data as LoadTestExecution);
        
        // Stop polling if test is complete
        if (data.status === 'completed' || data.status === 'failed') {
          setIsRunning(false);
          toast({
            title: data.status === 'completed' ? "Load Test Completed" : "Load Test Failed",
            description: data.status === 'completed' 
              ? `${data.total_requests} requests completed with ${data.error_rate?.toFixed(1)}% error rate`
              : "Test execution failed",
            variant: data.status === 'completed' ? "default" : "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error fetching execution status:', error);
    }
  };

  const fetchRealtimeMetrics = async (executionId: string) => {
    try {
      const { data, error } = await supabase
        .from('load_test_metrics')
        .select('*')
        .eq('execution_id', executionId)
        .order('timestamp_recorded', { ascending: true });

      if (error) throw error;
      setRealtimeMetrics(data || []);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const createConfiguration = async (config: LoadTestConfig) => {
    try {
      const { data, error } = await supabase
        .from('load_test_configurations')
        .insert({
          name: config.name,
          target_url: config.target_url,
          virtual_users: config.virtual_users,
          duration_seconds: config.duration_seconds,
          ramp_up_seconds: config.ramp_up_seconds,
          test_scenario: config.test_scenario,
          headers: config.headers || {},
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating configuration:', error);
      throw error;
    }
  };

  const runLoadTest = async (config: LoadTestConfig) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to run load tests",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setRealtimeMetrics([]);

    try {
      // Create configuration if it doesn't exist
      const configData = config.id ? config : await createConfiguration(config);

      toast({
        title: "Load Test Starting",
        description: `Initializing ${config.name} with ${config.virtual_users} users for ${config.duration_seconds}s`
      });

      // Call the Edge Function to start the load test
      const { data, error } = await supabase.functions.invoke('run-load-test', {
        body: { configId: configData.id }
      });

      if (error) throw error;

      if (data?.executionId) {
        // Start monitoring the execution
        await fetchExecutionStatus(data.executionId);
      }

    } catch (error) {
      console.error('Error starting load test:', error);
      toast({
        title: "Load Test Failed to Start",
        description: `Failed to start ${config.name}: ${error}`,
        variant: "destructive"
      });
      setIsRunning(false);
    }
  };

  const stopLoadTest = async () => {
    if (!currentExecution) return;

    try {
      await supabase
        .from('load_test_executions')
        .update({ status: 'cancelled' })
        .eq('id', currentExecution.id);

      setIsRunning(false);
      setCurrentExecution(null);

      toast({
        title: "Load Test Stopped",
        description: "The load test has been cancelled"
      });
    } catch (error) {
      console.error('Error stopping test:', error);
      toast({
        title: "Error",
        description: "Failed to stop the load test",
        variant: "destructive"
      });
    }
  };

  const getMetricsSummary = () => {
    if (!currentExecution) {
      return {
        avgResponseTime: 0,
        maxResponseTime: 0,
        requestsPerSecond: 0,
        errorRate: 0,
        totalRequests: 0
      };
    }

    return {
      avgResponseTime: currentExecution.average_response_time || 0,
      maxResponseTime: currentExecution.max_response_time || 0,
      requestsPerSecond: currentExecution.requests_per_second || 0,
      errorRate: currentExecution.error_rate || 0,
      totalRequests: currentExecution.total_requests || 0
    };
  };

  const metrics = getMetricsSummary();

  // Prepare chart data from realtime metrics
  const chartData = realtimeMetrics.map((metric, index) => ({
    time: new Date(metric.timestamp_recorded).toLocaleTimeString(),
    responseTime: metric.response_time || 0,
    requestsPerSecond: metric.requests_per_second || 0,
    errorCount: metric.error_count || 0,
    activeUsers: metric.active_users || 0
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Real Load Test Manager</h3>
          <p className="text-muted-foreground">Performance testing with actual network requests</p>
        </div>
      </div>

      {/* Running Test Status */}
      {isRunning && currentExecution && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
                Running: {currentExecution.configuration_id}
              </div>
              <Button variant="outline" size="sm" onClick={stopLoadTest}>
                <StopCircle className="w-4 h-4 mr-2" />
                Stop Test
              </Button>
            </CardTitle>
            <CardDescription>
              Status: {currentExecution.status} • {currentExecution.total_requests} requests completed
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Real-time Metrics */}
      {currentExecution && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgResponseTime.toFixed(0)}ms</div>
              <div className="text-xs text-muted-foreground">
                Max: {metrics.maxResponseTime.toFixed(0)}ms
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.requestsPerSecond.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Requests/sec</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.errorRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">
                {currentExecution.failed_requests} failures
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalRequests}</div>
              <div className="text-xs text-muted-foreground">
                {currentExecution.successful_requests} successful
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <Badge variant={currentExecution.status === 'running' ? 'secondary' : 'default'}>
                  {currentExecution.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value}ms`, 'Response Time']} />
                    <Line type="monotone" dataKey="responseTime" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Throughput & Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="requestsPerSecond" stroke="#82ca9d" name="Requests/sec" />
                    <Line type="monotone" dataKey="errorCount" stroke="#ff7c7c" name="Errors" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Rate Alert */}
      {metrics.errorRate > 5 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            High error rate detected ({metrics.errorRate.toFixed(1)}%). This indicates performance issues or system overload.
          </AlertDescription>
        </Alert>
      )}

      {/* Predefined Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Predefined Load Tests</CardTitle>
          <CardDescription>Real performance tests with actual network requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predefinedConfigs.map((config, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{config.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {config.virtual_users} users • {config.duration_seconds}s • {config.target_url}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => runLoadTest(config)}
                  disabled={isRunning}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Load Test</CardTitle>
          <CardDescription>Configure and run a custom real load test</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-name">Test Name</Label>
                <Input
                  id="test-name"
                  value={customConfig.name}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Custom Test"
                />
              </div>
              <div>
                <Label htmlFor="test-url">Target URL</Label>
                <Input
                  id="test-url"
                  value={customConfig.target_url}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, target_url: e.target.value }))}
                  placeholder="/dashboard"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="users">Virtual Users</Label>
                <Input
                  id="users"
                  type="number"
                  value={customConfig.virtual_users}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, virtual_users: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={customConfig.duration_seconds}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, duration_seconds: parseInt(e.target.value) || 0 }))}
                  min="10"
                  max="600"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => runLoadTest(customConfig)}
              disabled={isRunning || !customConfig.name || !customConfig.target_url}
            >
              <Zap className="w-4 h-4 mr-2" />
              Run Real Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Executions</CardTitle>
          <CardDescription>History of load test runs</CardDescription>
        </CardHeader>
        <CardContent>
          {executions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No test executions yet</p>
          ) : (
            <div className="space-y-2">
              {executions.slice(0, 5).map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Execution {execution.id.slice(0, 8)}</div>
                    <div className="text-sm text-muted-foreground">
                      {execution.total_requests} requests • {execution.error_rate?.toFixed(1)}% error rate
                    </div>
                  </div>
                  <Badge variant={execution.status === 'completed' ? 'default' : 'secondary'}>
                    {execution.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};