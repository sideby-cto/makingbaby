
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Play, Square, Loader2, Activity, Users, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TestScenariosTab } from './TestScenariosTab';
import { SyntheticMonitoringTab } from './SyntheticMonitoringTab';
import { PerformanceBudgetsTab } from './PerformanceBudgetsTab';

interface LoadTestConfig {
  id: string;
  name: string;
  description: string;
  target_url: string;
  virtual_users: number;
  duration_seconds: number;
  ramp_up_seconds: number;
}

interface LoadTestExecution {
  id: string;
  configuration_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time: number | null;
  min_response_time: number | null;
  max_response_time: number | null;
  requests_per_second: number | null;
  error_rate: number | null;
  results_data: any;
  performance_metrics: any;
}

interface LoadTestMetric {
  id: string;
  execution_id: string;
  timestamp_recorded: string;
  active_users: number;
  requests_per_second: number | null;
  response_time: number | null;
  error_count: number;
}

export const CoreFlowTestingPage = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<LoadTestConfig[]>([]);
  const [executions, setExecutions] = useState<LoadTestExecution[]>([]);
  const [currentExecution, setCurrentExecution] = useState<LoadTestExecution | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<LoadTestMetric[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Form state for creating new configurations
  const [newConfig, setNewConfig] = useState({
    name: '',
    description: '',
    target_url: 'https://my.sideby.ai',
    virtual_users: 10,
    duration_seconds: 60,
    ramp_up_seconds: 10
  });

  // Load configurations and executions
  useEffect(() => {
    loadConfigurations();
    loadExecutions();
  }, []);

  // Poll for execution updates when running
  useEffect(() => {
    if (!currentExecution || currentExecution.status === 'completed' || currentExecution.status === 'failed') {
      setIsRunning(false);
      return;
    }

    const interval = setInterval(async () => {
      await updateExecutionStatus(currentExecution.id);
      await loadRealtimeMetrics(currentExecution.id);
    }, 2000);

    return () => clearInterval(interval);
  }, [currentExecution]);

  // Update progress based on execution duration
  useEffect(() => {
    if (!currentExecution || currentExecution.status !== 'running') {
      return;
    }

    const startTime = new Date(currentExecution.started_at).getTime();
    const configDuration = configs.find(c => c.id === currentExecution.configuration_id)?.duration_seconds || 60;
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progressPercent = Math.min((elapsed / configDuration) * 100, 100);
      setProgress(progressPercent);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentExecution, configs]);

  const loadConfigurations = async () => {
    const { data, error } = await supabase
      .from('load_test_configurations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading configurations",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setConfigs(data || []);
  };

  const loadExecutions = async () => {
    const { data, error } = await supabase
      .from('load_test_executions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      toast({
        title: "Error loading executions",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setExecutions(data || []);
  };

  const updateExecutionStatus = async (executionId: string) => {
    const { data, error } = await supabase
      .from('load_test_executions')
      .select('*')
      .eq('id', executionId)
      .single();

    if (error) {
      console.error('Error updating execution status:', error);
      return;
    }

    if (data) {
      setCurrentExecution(data);
      setExecutions(prev => prev.map(ex => ex.id === executionId ? data : ex));
      
      if (data.status === 'completed' || data.status === 'failed') {
        setIsRunning(false);
        setProgress(100);
        toast({
          title: `Load test ${data.status}`,
          description: `Test execution ${data.status} successfully.`,
          variant: data.status === 'completed' ? "default" : "destructive"
        });
      }
    }
  };

  const loadRealtimeMetrics = async (executionId: string) => {
    const { data, error } = await supabase
      .from('load_test_metrics')
      .select('*')
      .eq('execution_id', executionId)
      .order('timestamp_recorded', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading metrics:', error);
      return;
    }

    setRealtimeMetrics(data || []);
  };

  const createConfiguration = async () => {
    if (!newConfig.name || !newConfig.target_url) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name and target URL",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await supabase
      .from('load_test_configurations')
      .insert([{
        ...newConfig,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error creating configuration",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Configuration created",
      description: "Load test configuration created successfully"
    });

    setConfigs(prev => [data, ...prev]);
    setNewConfig({
      name: '',
      description: '',
      target_url: 'https://my.sideby.ai',
      virtual_users: 10,
      duration_seconds: 60,
      ramp_up_seconds: 10
    });
  };

  const runLoadTest = async (configId: string) => {
    setIsRunning(true);
    setProgress(0);
    setRealtimeMetrics([]);

    try {
      const { data, error } = await supabase.functions.invoke('run-load-test', {
        body: { configurationId: configId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Load test started",
          description: "Load test is now running..."
        });

        // Start polling for the execution
        const { data: execution } = await supabase
          .from('load_test_executions')
          .select('*')
          .eq('id', data.executionId)
          .single();

        if (execution) {
          setCurrentExecution(execution);
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Load test error:', error);
      toast({
        title: "Load test failed",
        description: error.message,
        variant: "destructive"
      });
      setIsRunning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      running: "default",
      completed: "secondary",
      failed: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Core Flow Testing</h1>
          <p className="text-muted-foreground">Load testing and performance monitoring for sideby core flows</p>
        </div>
      </div>

      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
          <TabsTrigger value="synthetic">Synthetic Monitoring</TabsTrigger>
          <TabsTrigger value="budgets">Performance Budgets</TabsTrigger>
          <TabsTrigger value="load-tests">Load Tests</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios">
          <TestScenariosTab />
        </TabsContent>

        <TabsContent value="synthetic">
          <SyntheticMonitoringTab />
        </TabsContent>

        <TabsContent value="budgets">
          <PerformanceBudgetsTab />
        </TabsContent>

        <TabsContent value="load-tests" className="space-y-4">
          <div className="grid gap-4">
            {configs.map((config) => (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{config.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                    <Button 
                      onClick={() => runLoadTest(config.id)}
                      disabled={isRunning}
                      size="sm"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run Test
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Target:</span>
                      <p className="font-medium">{config.target_url}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Users:</span>
                      <p className="font-medium">{config.virtual_users}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">{formatDuration(config.duration_seconds)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ramp-up:</span>
                      <p className="font-medium">{formatDuration(config.ramp_up_seconds)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Current Execution Status */}
          {currentExecution && isRunning && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Current Load Test
                  {getStatusBadge(currentExecution.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
                
                {realtimeMetrics.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Users className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                      <p className="text-2xl font-bold">{realtimeMetrics[0]?.active_users || 0}</p>
                      <p className="text-xs text-muted-foreground">Active Users</p>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-500" />
                      <p className="text-2xl font-bold">{realtimeMetrics[0]?.requests_per_second?.toFixed(1) || '0'}</p>
                      <p className="text-xs text-muted-foreground">Req/sec</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                      <p className="text-2xl font-bold">{realtimeMetrics[0]?.response_time || 0}ms</p>
                      <p className="text-xs text-muted-foreground">Response Time</p>
                    </div>
                    <div className="text-center">
                      <AlertCircle className="w-4 h-4 mx-auto mb-1 text-red-500" />
                      <p className="text-2xl font-bold">{realtimeMetrics[0]?.error_count || 0}</p>
                      <p className="text-xs text-muted-foreground">Errors</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="configurations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newConfig.name}
                    onChange={(e) => setNewConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Test name"
                  />
                </div>
                <div>
                  <Label htmlFor="target_url">Target URL</Label>
                  <Input
                    id="target_url"
                    value={newConfig.target_url}
                    onChange={(e) => setNewConfig(prev => ({ ...prev, target_url: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="virtual_users">Virtual Users</Label>
                  <Input
                    id="virtual_users"
                    type="number"
                    value={newConfig.virtual_users}
                    onChange={(e) => setNewConfig(prev => ({ ...prev, virtual_users: parseInt(e.target.value) || 10 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="duration_seconds">Duration (seconds)</Label>
                  <Input
                    id="duration_seconds"
                    type="number"
                    value={newConfig.duration_seconds}
                    onChange={(e) => setNewConfig(prev => ({ ...prev, duration_seconds: parseInt(e.target.value) || 60 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="ramp_up_seconds">Ramp-up (seconds)</Label>
                  <Input
                    id="ramp_up_seconds"
                    type="number"
                    value={newConfig.ramp_up_seconds}
                    onChange={(e) => setNewConfig(prev => ({ ...prev, ramp_up_seconds: parseInt(e.target.value) || 10 }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newConfig.description}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Test description"
                />
              </div>
              <Button onClick={createConfiguration}>Create Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {executions.map((execution) => (
              <Card key={execution.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Execution {execution.id.slice(0, 8)}...
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Started: {new Date(execution.started_at).toLocaleString()}
                      </p>
                    </div>
                    {getStatusBadge(execution.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {execution.status === 'completed' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Requests:</span>
                        <p className="font-medium">{execution.total_requests || 0}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <p className="font-medium">
                          {execution.total_requests > 0 
                            ? `${Math.round((execution.successful_requests / execution.total_requests) * 100)}%`
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Response:</span>
                        <p className="font-medium">{execution.average_response_time || 0}ms</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">RPS:</span>
                        <p className="font-medium">{execution.requests_per_second?.toFixed(1) || '0'}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};
