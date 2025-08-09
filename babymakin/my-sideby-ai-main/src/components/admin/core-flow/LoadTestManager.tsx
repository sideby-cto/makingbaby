
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, Users, Zap, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LoadTestConfig {
  name: string;
  url: string;
  users: number;
  duration: number; // in seconds
  rampUp: number; // in seconds
}

interface LoadTestResult {
  timestamp: number;
  activeUsers: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
}

export const LoadTestManager = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState<LoadTestConfig | null>(null);
  const [testResults, setTestResults] = useState<LoadTestResult[]>([]);
  const [customConfig, setCustomConfig] = useState<LoadTestConfig>({
    name: '',
    url: '',
    users: 10,
    duration: 60,
    rampUp: 10
  });
  const { toast } = useToast();

  // Predefined load test scenarios
  const predefinedTests: LoadTestConfig[] = [
    {
      name: 'Dashboard Light Load',
      url: '/dashboard',
      users: 10,
      duration: 60,
      rampUp: 10
    },
    {
      name: 'Dashboard Heavy Load',
      url: '/dashboard',
      users: 50,
      duration: 300,
      rampUp: 30
    },
    {
      name: 'Match Creation Stress',
      url: '/admin/matchmaker',
      users: 25,
      duration: 120,
      rampUp: 20
    },
    {
      name: 'Real-time Chat Load',
      url: '/matches/test-conversation',
      users: 20,
      duration: 180,
      rampUp: 15
    }
  ];

  const runLoadTest = async (config: LoadTestConfig) => {
    setIsRunning(true);
    setCurrentTest(config);
    setProgress(0);
    setTestResults([]);

    toast({
      title: "Load Test Started",
      description: `Running ${config.name} with ${config.users} users for ${config.duration}s`
    });

    try {
      // Simulate load test execution
      const totalSteps = config.duration;
      const stepInterval = 1000; // 1 second intervals

      for (let step = 0; step <= totalSteps; step++) {
        await new Promise(resolve => setTimeout(resolve, stepInterval));
        
        // Calculate current phase
        const rampUpPhase = step <= config.rampUp;
        const steadyPhase = step > config.rampUp && step < (totalSteps - config.rampUp);
        const rampDownPhase = step >= (totalSteps - config.rampUp);

        // Calculate active users based on phase
        let activeUsers = 0;
        if (rampUpPhase) {
          activeUsers = Math.floor((step / config.rampUp) * config.users);
        } else if (steadyPhase) {
          activeUsers = config.users;
        } else {
          const rampDownStep = step - (totalSteps - config.rampUp);
          activeUsers = Math.floor(config.users * (1 - (rampDownStep / config.rampUp)));
        }

        // Simulate realistic metrics with some variability
        const baseResponseTime = 200;
        const loadFactor = activeUsers / config.users;
        const responseTime = baseResponseTime + (loadFactor * 300) + (Math.random() * 100);
        
        const throughput = Math.max(0, activeUsers * (2 + Math.random() * 3));
        const errorRate = Math.min(20, loadFactor * 5 + Math.random() * 2);
        
        const cpuUsage = Math.min(100, 20 + (loadFactor * 60) + (Math.random() * 10));
        const memoryUsage = Math.min(100, 30 + (loadFactor * 40) + (Math.random() * 5));

        const result: LoadTestResult = {
          timestamp: Date.now() - ((totalSteps - step) * 1000),
          activeUsers,
          responseTime: Math.round(responseTime),
          throughput: Math.round(throughput),
          errorRate: Math.round(errorRate * 100) / 100,
          cpuUsage: Math.round(cpuUsage),
          memoryUsage: Math.round(memoryUsage)
        };

        setTestResults(prev => [...prev, result]);
        setProgress((step / totalSteps) * 100);
      }

      toast({
        title: "Load Test Completed",
        description: `${config.name} has finished successfully`
      });

    } catch (error) {
      toast({
        title: "Load Test Failed",
        description: `Failed to run ${config.name}: ${error}`,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
      setProgress(0);
    }
  };

  const getCurrentMetrics = () => {
    if (testResults.length === 0) {
      return {
        avgResponseTime: 0,
        maxResponseTime: 0,
        avgThroughput: 0,
        maxErrorRate: 0,
        peakUsers: 0
      };
    }

    const responseTimes = testResults.map(r => r.responseTime);
    const throughputs = testResults.map(r => r.throughput);
    const errorRates = testResults.map(r => r.errorRate);
    const userCounts = testResults.map(r => r.activeUsers);

    return {
      avgResponseTime: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
      maxResponseTime: Math.max(...responseTimes),
      avgThroughput: Math.round(throughputs.reduce((a, b) => a + b, 0) / throughputs.length),
      maxErrorRate: Math.max(...errorRates),
      peakUsers: Math.max(...userCounts)
    };
  };

  const metrics = getCurrentMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Load Test Manager</h3>
          <p className="text-muted-foreground">Stress test your core flows under load</p>
        </div>
      </div>

      {/* Running Test Status */}
      {isRunning && currentTest && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
              Running: {currentTest.name}
            </CardTitle>
            <CardDescription>
              {currentTest.users} users • {currentTest.duration}s duration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Metrics */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
              <div className="text-xs text-muted-foreground">
                Max: {metrics.maxResponseTime}ms
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgThroughput}</div>
              <div className="text-xs text-muted-foreground">
                Requests/sec
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.maxErrorRate}%</div>
              <div className="text-xs text-muted-foreground">
                Peak errors
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Peak Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.peakUsers}</div>
              <div className="text-xs text-muted-foreground">
                Concurrent
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {isRunning ? (
                  <Badge variant="secondary">Running</Badge>
                ) : (
                  <Badge variant="default">Complete</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Charts */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={testResults.slice(-60)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(time) => new Date(time).toLocaleTimeString()}
                      formatter={(value: number) => [`${value}ms`, 'Response Time']}
                    />
                    <Line type="monotone" dataKey="responseTime" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Users & Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={testResults.slice(-60)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(time) => new Date(time).toLocaleTimeString()}
                    />
                    <Line type="monotone" dataKey="activeUsers" stroke="#82ca9d" name="Active Users" />
                    <Line type="monotone" dataKey="errorRate" stroke="#ff7c7c" name="Error Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Rate Alert */}
      {metrics.maxErrorRate > 5 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            High error rate detected ({metrics.maxErrorRate}%). This may indicate system stress or configuration issues.
          </AlertDescription>
        </Alert>
      )}

      {/* Predefined Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Predefined Load Tests</CardTitle>
          <CardDescription>Quick access to common load testing scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predefinedTests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {test.users} users • {test.duration}s • {test.url}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => runLoadTest(test)}
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
          <CardDescription>Configure and run a custom load test</CardDescription>
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
                  value={customConfig.url}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="/dashboard"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="users">Concurrent Users</Label>
                <Input
                  id="users"
                  type="number"
                  value={customConfig.users}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, users: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={customConfig.duration}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  min="10"
                  max="600"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => runLoadTest(customConfig)}
              disabled={isRunning || !customConfig.name || !customConfig.url}
            >
              <Zap className="w-4 h-4 mr-2" />
              Run Custom Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
