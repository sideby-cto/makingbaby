import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Plus, Globe, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyntheticMonitor {
  id: string;
  monitor_name: string;
  monitor_type: string;
  target_url: string;
  check_frequency: number;
  timeout_ms: number;
  expected_response_time_ms: number;
  assertions: any;
  locations: string[];
  last_check_at?: string;
  last_status?: string;
  consecutive_failures: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface SyntheticCheckResult {
  id: string;
  monitor_id: string;
  check_time: string;
  status: string;
  response_time_ms?: number;
  error_message?: string;
  response_code?: number;
  assertions_passed: number;
  assertions_failed: number;
  location: string;
}

export const SyntheticMonitoringTab = () => {
  const { toast } = useToast();
  const [monitors, setMonitors] = useState<SyntheticMonitor[]>([]);
  const [results, setResults] = useState<SyntheticCheckResult[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newMonitor, setNewMonitor] = useState({
    monitor_name: '',
    monitor_type: 'uptime',
    target_url: 'https://my.sideby.ai',
    check_frequency: 300,
    timeout_ms: 30000,
    expected_response_time_ms: 3000,
    assertions: '[]',
    locations: 'us-east-1'
  });

  useEffect(() => {
    loadMonitors();
    loadResults();
    
    // Set up real-time updates for monitor results
    const interval = setInterval(() => {
      loadResults();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadMonitors = async () => {
    const { data, error } = await supabase
      .from('synthetic_monitoring')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading monitors",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setMonitors(data?.map(monitor => ({
      ...monitor,
      assertions: Array.isArray(monitor.assertions) ? monitor.assertions : JSON.parse(monitor.assertions as string || '[]')
    })) || []);
  };

  const loadResults = async () => {
    const { data, error } = await supabase
      .from('synthetic_check_results')
      .select('*')
      .order('check_time', { ascending: false })
      .limit(100);

    if (error) {
      toast({
        title: "Error loading results",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setResults(data || []);
  };

  const createMonitor = async () => {
    try {
      const parsedAssertions = JSON.parse(newMonitor.assertions);
      const locationsArray = newMonitor.locations.split(',').map(loc => loc.trim());

      const { data, error } = await supabase
        .from('synthetic_monitoring')
        .insert([{
          ...newMonitor,
          assertions: parsedAssertions,
          locations: locationsArray
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Monitor created",
        description: "Synthetic monitor created successfully"
      });

      setMonitors(prev => [{
        ...data,
        assertions: Array.isArray(data.assertions) ? data.assertions : JSON.parse(data.assertions as string || '[]')
      }, ...prev]);
      setNewMonitor({
        monitor_name: '',
        monitor_type: 'uptime',
        target_url: 'https://my.sideby.ai',
        check_frequency: 300,
        timeout_ms: 30000,
        expected_response_time_ms: 3000,
        assertions: '[]',
        locations: 'us-east-1'
      });
      setShowCreateForm(false);
    } catch (error: any) {
      toast({
        title: "Error creating monitor",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleMonitor = async (monitorId: string, enabled: boolean) => {
    const { error } = await supabase
      .from('synthetic_monitoring')
      .update({ enabled })
      .eq('id', monitorId);

    if (error) {
      toast({
        title: "Error updating monitor",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setMonitors(prev => prev.map(m => 
      m.id === monitorId ? { ...m, enabled } : m
    ));
  };

  const runMonitorCheck = async (monitorId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('run-synthetic-check', {
        body: { monitorId }
      });

      if (error) throw error;

      toast({
        title: "Check started",
        description: "Synthetic check is running..."
      });

      // Reload results after a short delay
      setTimeout(loadResults, 3000);
    } catch (error: any) {
      toast({
        title: "Error running check",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      success: "text-green-500",
      failure: "text-red-500",
      timeout: "text-orange-500",
      error: "text-red-500",
      unknown: "text-gray-500"
    };
    return colors[status as keyof typeof colors] || colors.unknown;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failure':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'timeout':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Globe className="w-4 h-4 text-gray-500" />;
    }
  };

  const getUptimePercentage = (monitorId: string) => {
    const monitorResults = results.filter(r => r.monitor_id === monitorId).slice(0, 100);
    if (monitorResults.length === 0) return 100;
    
    const successCount = monitorResults.filter(r => r.status === 'success').length;
    return Math.round((successCount / monitorResults.length) * 100);
  };

  const getAverageResponseTime = (monitorId: string) => {
    const monitorResults = results
      .filter(r => r.monitor_id === monitorId && r.response_time_ms)
      .slice(0, 20);
    
    if (monitorResults.length === 0) return 0;
    
    const total = monitorResults.reduce((sum, r) => sum + (r.response_time_ms || 0), 0);
    return Math.round(total / monitorResults.length);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Synthetic Monitoring</h2>
          <p className="text-muted-foreground">Monitor uptime and performance of critical endpoints</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Monitor
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Monitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monitor_name">Monitor Name</Label>
                <Input
                  id="monitor_name"
                  value={newMonitor.monitor_name}
                  onChange={(e) => setNewMonitor(prev => ({ ...prev, monitor_name: e.target.value }))}
                  placeholder="Homepage uptime check"
                />
              </div>
              <div>
                <Label htmlFor="monitor_type">Type</Label>
                <Select value={newMonitor.monitor_type} onValueChange={(value) => setNewMonitor(prev => ({ ...prev, monitor_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uptime">Uptime</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="user_journey">User Journey</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target_url">Target URL</Label>
                <Input
                  id="target_url"
                  value={newMonitor.target_url}
                  onChange={(e) => setNewMonitor(prev => ({ ...prev, target_url: e.target.value }))}
                  placeholder="https://my.sideby.ai"
                />
              </div>
              <div>
                <Label htmlFor="check_frequency">Check Frequency (seconds)</Label>
                <Input
                  id="check_frequency"
                  type="number"
                  value={newMonitor.check_frequency}
                  onChange={(e) => setNewMonitor(prev => ({ ...prev, check_frequency: parseInt(e.target.value) || 300 }))}
                />
              </div>
              <div>
                <Label htmlFor="timeout_ms">Timeout (ms)</Label>
                <Input
                  id="timeout_ms"
                  type="number"
                  value={newMonitor.timeout_ms}
                  onChange={(e) => setNewMonitor(prev => ({ ...prev, timeout_ms: parseInt(e.target.value) || 30000 }))}
                />
              </div>
              <div>
                <Label htmlFor="expected_response_time_ms">Expected Response Time (ms)</Label>
                <Input
                  id="expected_response_time_ms"
                  type="number"
                  value={newMonitor.expected_response_time_ms}
                  onChange={(e) => setNewMonitor(prev => ({ ...prev, expected_response_time_ms: parseInt(e.target.value) || 3000 }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="locations">Locations (comma-separated)</Label>
              <Input
                id="locations"
                value={newMonitor.locations}
                onChange={(e) => setNewMonitor(prev => ({ ...prev, locations: e.target.value }))}
                placeholder="us-east-1, eu-west-1"
              />
            </div>
            <div>
              <Label htmlFor="assertions">Assertions (JSON)</Label>
              <Input
                id="assertions"
                value={newMonitor.assertions}
                onChange={(e) => setNewMonitor(prev => ({ ...prev, assertions: e.target.value }))}
                placeholder='[{"type": "status", "operator": "equals", "value": 200}]'
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createMonitor}>Create Monitor</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {monitors.map((monitor) => {
          const uptime = getUptimePercentage(monitor.id);
          const avgResponseTime = getAverageResponseTime(monitor.id);
          const recentResult = results.find(r => r.monitor_id === monitor.id);

          return (
            <Card key={monitor.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{monitor.monitor_name}</CardTitle>
                    <Badge variant="outline">{monitor.monitor_type}</Badge>
                    {recentResult && getStatusIcon(recentResult.status)}
                    {monitor.consecutive_failures > 0 && (
                      <Badge variant="destructive">
                        {monitor.consecutive_failures} failures
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={monitor.enabled}
                      onCheckedChange={(enabled) => toggleMonitor(monitor.id, enabled)}
                    />
                    <Button
                      onClick={() => runMonitorCheck(monitor.id)}
                      disabled={!monitor.enabled}
                      size="sm"
                      variant="outline"
                    >
                      Check Now
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p><strong>URL:</strong> {monitor.target_url}</p>
                    <p><strong>Frequency:</strong> Every {monitor.check_frequency} seconds</p>
                    <p><strong>Locations:</strong> {monitor.locations.join(', ')}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{uptime}%</div>
                      <div className="text-xs text-muted-foreground">Uptime (100 checks)</div>
                      <Progress value={uptime} className="mt-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{avgResponseTime}ms</div>
                      <div className="text-xs text-muted-foreground">Avg Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{monitor.assertions.length}</div>
                      <div className="text-xs text-muted-foreground">Assertions</div>
                    </div>
                  </div>

                  {recentResult && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center text-sm">
                        <span>Last check:</span>
                        <span>{new Date(recentResult.check_time).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Status:</span>
                        <span className={getStatusColor(recentResult.status)}>
                          {recentResult.status}
                        </span>
                      </div>
                      {recentResult.response_time_ms && (
                        <div className="flex justify-between items-center text-sm">
                          <span>Response time:</span>
                          <span>{recentResult.response_time_ms}ms</span>
                        </div>
                      )}
                      {recentResult.error_message && (
                        <div className="text-sm text-red-600 mt-2">
                          <strong>Error:</strong> {recentResult.error_message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};