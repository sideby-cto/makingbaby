import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, CheckCircle, Clock, User, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FlowAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  flow_step?: string;
  triggered_at: string;
  test_name: string;
  error_message?: string;
}

export const FlowAlertsCenter = () => {
  const [alerts, setAlerts] = useState<FlowAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recent' | 'critical'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
    
    // Set up real-time updates for test executions
    const channel = supabase
      .channel('core-flow-test-executions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'core_flow_test_executions' },
        () => loadAlerts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAlerts = async () => {
    try {
      // Get failed test executions as alerts
      const { data: executions, error } = await supabase
        .from('core_flow_test_executions')
        .select(`
          *,
          core_flow_tests (
            test_name,
            critical
          )
        `)
        .eq('status', 'failed')
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Transform executions into alerts
      const transformedAlerts = executions?.map(execution => ({
        id: execution.id,
        alert_type: 'test_failure',
        severity: execution.core_flow_tests?.critical ? 'critical' : 'medium',
        title: `Test Failure: ${execution.core_flow_tests?.test_name || 'Unknown Test'}`,
        message: execution.error_message || 'Test execution failed without specific error message',
        triggered_at: execution.started_at,
        test_name: execution.core_flow_tests?.test_name || 'Unknown Test',
        error_message: execution.error_message,
        flow_step: execution.core_flow_tests?.test_name?.toLowerCase().replace(/\s+/g, '_')
      })) || [];
      
      setAlerts(transformedAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dismissAlert = async (alertId: string) => {
    // Since alerts are derived from test executions, we can just remove from local state
    // In a real implementation, you might want to track dismissed alerts
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    
    toast({
      title: "Alert Dismissed",
      description: "Alert has been dismissed from view"
    });
  };

  const rerunTest = async (alertId: string) => {
    try {
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) return;

      // Find the test and create a new execution
      const { data: test } = await supabase
        .from('core_flow_tests')
        .select('id')
        .eq('test_name', alert.test_name)
        .single();

      if (test) {
        const { error } = await supabase
          .from('core_flow_test_executions')
          .insert({
            test_id: test.id,
            status: 'running',
            started_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "Test Restarted",
          description: "The failed test has been restarted"
        });
      }
    } catch (error) {
      console.error('Error rerunning test:', error);
      toast({
        title: "Error",
        description: "Failed to rerun test",
        variant: "destructive"
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    
    return (
      <Badge className={`${colors[severity as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getAlertTypeLabel = (alertType: string) => {
    const labels = {
      test_failure: 'Test Failure',
      health_degradation: 'Health Degradation',
      incident_created: 'Incident Created',
      quality_gate_failed: 'Quality Gate Failed'
    };
    
    return labels[alertType as keyof typeof labels] || alertType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'recent') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return new Date(alert.triggered_at) > oneDayAgo;
    }
    if (filter === 'critical') return alert.severity === 'critical';
    return true;
  });

  if (isLoading) {
    return <div className="text-center">Loading alerts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Flow Alerts Center</h2>
          <p className="text-muted-foreground">
            Monitor and manage alerts from the core flow monitoring system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAlerts}>
            Refresh Alerts
          </Button>
        </div>
      </div>

      {/* Alert Filters */}
      <div className="flex gap-2">
        {(['all', 'recent', 'critical'] as const).map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filterType)}
          >
            {filterType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            <Badge variant="secondary" className="ml-2">
              {filterType === 'all' ? alerts.length :
               filterType === 'recent' ? alerts.filter(a => new Date(a.triggered_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length :
               alerts.filter(a => a.severity === 'critical').length}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Alert Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {['critical', 'high', 'medium', 'low'].map((severity) => {
          const count = alerts.filter(a => a.severity === severity).length;
          return (
            <Card key={severity}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground capitalize">
                      {severity} Alerts
                    </p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  {getSeverityIcon(severity)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div>
                    <CardTitle className="text-base">{alert.title}</CardTitle>
                    <CardDescription>
                      {getAlertTypeLabel(alert.alert_type)}
                      {alert.flow_step && ` • ${alert.flow_step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
                      • {new Date(alert.triggered_at).toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(alert.severity)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">{alert.message}</p>

                {alert.error_message && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-xs font-medium text-red-700 mb-1">Error Details:</p>
                    <pre className="text-xs text-red-600 overflow-x-auto">
                      {alert.error_message}
                    </pre>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.round((new Date().getTime() - new Date(alert.triggered_at).getTime()) / (1000 * 60))}m ago
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rerunTest(alert.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Rerun Test
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Alerts</h3>
            <p className="text-muted-foreground">
              {filter === 'all' ? 'No test failures detected.' :
               filter === 'recent' ? 'No recent test failures.' :
               'No critical test failures.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};