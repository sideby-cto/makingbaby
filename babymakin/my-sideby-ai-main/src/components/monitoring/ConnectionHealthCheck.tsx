import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Wifi, WifiOff, RefreshCw, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConnectionTest {
  name: string;
  status: 'pending' | 'success' | 'error';
  latency?: number;
  error?: string;
}

export const ConnectionHealthCheck = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [tests, setTests] = useState<ConnectionTest[]>([
    { name: 'Database Connection', status: 'pending' },
    { name: 'WebSocket Connection', status: 'pending' },
    { name: 'Auth Service', status: 'pending' },
    { name: 'Edge Functions', status: 'pending' },
    { name: 'Storage Service', status: 'pending' }
  ]);
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'degraded' | 'down'>('healthy');

  const runHealthCheck = async () => {
    setIsRunning(true);
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' })));

    const testResults: ConnectionTest[] = [];

    // Test 1: Database Connection
    try {
      const start = performance.now();
      const { error } = await supabase.from('profiles').select('id').limit(1);
      const latency = performance.now() - start;
      
      testResults.push({
        name: 'Database Connection',
        status: error ? 'error' : 'success',
        latency: Math.round(latency),
        error: error?.message
      });
    } catch (err) {
      testResults.push({
        name: 'Database Connection',
        status: 'error',
        error: 'Connection failed'
      });
    }

    // Test 2: WebSocket Connection
    try {
      const channel = supabase.channel('health_check');
      const start = performance.now();
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('WebSocket timeout')), 10000);
        
        channel.subscribe((status) => {
          clearTimeout(timeout);
          const latency = performance.now() - start;
          
          if (status === 'SUBSCRIBED') {
            testResults.push({
              name: 'WebSocket Connection',
              status: 'success',
              latency: Math.round(latency)
            });
            resolve(status);
          } else {
            testResults.push({
              name: 'WebSocket Connection',
              status: 'error',
              error: `Status: ${status}`
            });
            reject(new Error(`WebSocket status: ${status}`));
          }
        });
      });
      
      supabase.removeChannel(channel);
    } catch (err) {
      testResults.push({
        name: 'WebSocket Connection',
        status: 'error',
        error: err instanceof Error ? err.message : 'WebSocket failed'
      });
    }

    // Test 3: Auth Service
    try {
      const start = performance.now();
      const { data, error } = await supabase.auth.getSession();
      const latency = performance.now() - start;
      
      testResults.push({
        name: 'Auth Service',
        status: error ? 'error' : 'success',
        latency: Math.round(latency),
        error: error?.message
      });
    } catch (err) {
      testResults.push({
        name: 'Auth Service',
        status: 'error',
        error: 'Auth service failed'
      });
    }

    // Test 4: Edge Functions (using a simple ping)
    try {
      const start = performance.now();
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(10000)
      });
      const latency = performance.now() - start;
      
      testResults.push({
        name: 'Edge Functions',
        status: response.ok ? 'success' : 'error',
        latency: Math.round(latency),
        error: response.ok ? undefined : `HTTP ${response.status}`
      });
    } catch (err) {
      testResults.push({
        name: 'Edge Functions',
        status: 'error',
        error: 'Function endpoint unreachable'
      });
    }

    // Test 5: Storage Service
    try {
      const start = performance.now();
      const { data, error } = await supabase.storage.listBuckets();
      const latency = performance.now() - start;
      
      testResults.push({
        name: 'Storage Service',
        status: error ? 'error' : 'success',
        latency: Math.round(latency),
        error: error?.message
      });
    } catch (err) {
      testResults.push({
        name: 'Storage Service',
        status: 'error',
        error: 'Storage service failed'
      });
    }

    // Update tests one by one for better UX
    for (let i = 0; i < testResults.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200)); // Small delay for better UX
      setTests(prev => prev.map((test, index) => 
        index === i ? testResults[i] : test
      ));
    }

    // Calculate overall health
    const errorCount = testResults.filter(test => test.status === 'error').length;
    const newHealth = errorCount === 0 ? 'healthy' : errorCount <= 2 ? 'degraded' : 'down';
    setOverallHealth(newHealth);

    setIsRunning(false);
  };

  // Auto-run health check on mount
  useEffect(() => {
    runHealthCheck();
    
    // Set up periodic health checks
    const interval = setInterval(runHealthCheck, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-500 text-white">Healthy</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      case 'pending': return <Badge variant="secondary">Testing...</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down': return <WifiOff className="h-5 w-5 text-red-500" />;
      default: return <Wifi className="h-5 w-5 text-gray-500" />;
    }
  };

  const successCount = tests.filter(test => test.status === 'success').length;
  const progressValue = (successCount / tests.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getHealthIcon(overallHealth)}
                System Health Check
              </CardTitle>
              <CardDescription>
                Real-time monitoring of core system components
              </CardDescription>
            </div>
            <Button 
              onClick={runHealthCheck} 
              disabled={isRunning}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Testing...' : 'Run Check'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Health</span>
            <Badge className={`${getHealthColor(overallHealth)} border-current capitalize`} variant="outline">
              {overallHealth}
            </Badge>
          </div>
          
          <Progress value={progressValue} className="h-2" />
          
          <div className="text-sm text-muted-foreground text-center">
            {successCount} of {tests.length} services healthy
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {tests.map((test, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <span className="font-medium">{test.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {test.latency && (
                    <span className="text-sm text-muted-foreground">
                      {test.latency}ms
                    </span>
                  )}
                  {getStatusBadge(test.status)}
                </div>
              </div>
              {test.error && (
                <Alert className="mt-3 border-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {test.error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {overallHealth !== 'healthy' && (
        <Alert className="border-orange-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some services are experiencing issues. This may impact application performance.
            {overallHealth === 'down' && ' Critical services are down - please contact support.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};