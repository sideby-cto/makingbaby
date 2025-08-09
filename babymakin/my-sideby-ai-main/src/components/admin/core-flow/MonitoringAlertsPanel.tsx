
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Bell, AlertTriangle, CheckCircle, Eye, EyeOff, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MonitoringAlert {
  id: string;
  type: 'performance' | 'error' | 'availability' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'error' | 'availability' | 'security';
  enabled: boolean;
  threshold: number;
  checkFunction: () => Promise<{ triggered: boolean; value: number; message: string }>;
}

export const MonitoringAlertsPanel = () => {
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: 'response-time',
      name: 'Response Time Alert',
      description: 'Alert when average response time exceeds threshold',
      type: 'performance',
      enabled: true,
      threshold: 2000, // 2 seconds
      checkFunction: async () => {
        const startTime = performance.now();
        await supabase.from('profiles').select('count').limit(1);
        const responseTime = performance.now() - startTime;
        
        return {
          triggered: responseTime > 2000,
          value: responseTime,
          message: `Database response time: ${responseTime.toFixed(0)}ms`
        };
      }
    },
    {
      id: 'error-rate',
      name: 'Error Rate Alert',
      description: 'Alert when error rate exceeds threshold',
      type: 'error',
      enabled: true,
      threshold: 5, // 5%
      checkFunction: async () => {
        const { data } = await supabase
          .from('core_flow_test_executions')
          .select('status')
          .order('started_at', { ascending: false })
          .limit(20);
        
        const tests = data || [];
        const errorRate = tests.length > 0 
          ? (tests.filter(t => t.status === 'failed').length / tests.length) * 100
          : 0;
        
        return {
          triggered: errorRate > 5,
          value: errorRate,
          message: `Error rate: ${errorRate.toFixed(1)}% over last 20 tests`
        };
      }
    },
    {
      id: 'test-failures',
      name: 'Critical Test Failures',
      description: 'Alert when critical tests fail',
      type: 'availability',
      enabled: true,
      threshold: 1,
      checkFunction: async () => {
        const { data } = await supabase
          .from('core_flow_test_executions')
          .select('*')
          .eq('status', 'failed')
          .order('started_at', { ascending: false })
          .limit(5);
        
        const criticalFailures = (data || []).filter(t => {
          const results = t.results as any;
          return results?.critical === true;
        }).length;
        
        return {
          triggered: criticalFailures >= 1,
          value: criticalFailures,
          message: `${criticalFailures} critical test failures detected`
        };
      }
    },
    {
      id: 'auth-issues',
      name: 'Authentication Issues',
      description: 'Alert when authentication problems occur',
      type: 'security',
      enabled: true,
      threshold: 1,
      checkFunction: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          return {
            triggered: !user,
            value: user ? 0 : 1,
            message: user ? 'Authentication working' : 'Authentication failed'
          };
        } catch (error) {
          return {
            triggered: true,
            value: 1,
            message: `Auth check failed: ${error}`
          };
        }
      }
    }
  ]);
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const checkAlerts = async () => {
    const newAlerts: MonitoringAlert[] = [];
    
    for (const rule of alertRules.filter(r => r.enabled)) {
      try {
        const result = await rule.checkFunction();
        
        if (result.triggered) {
          // Check if we already have an unresolved alert for this rule
          const existingAlert = alerts.find(a => 
            a.type === rule.type && 
            a.title.includes(rule.name) && 
            !a.resolved
          );
          
          if (!existingAlert) {
            const alert: MonitoringAlert = {
              id: `${rule.id}-${Date.now()}`,
              type: rule.type,
              severity: result.value > rule.threshold * 2 ? 'critical' : 'high',
              title: `${rule.name} Triggered`,
              message: result.message,
              timestamp: new Date(),
              acknowledged: false,
              resolved: false
            };
            
            newAlerts.push(alert);
            
            // Store alert locally (database integration coming soon)
            console.log('Alert generated:', alert);
          }
        }
      } catch (error) {
        console.error(`Error checking alert rule ${rule.name}:`, error);
      }
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev]);
      
      // Show toast for critical alerts
      const criticalAlerts = newAlerts.filter(a => a.severity === 'critical');
      if (criticalAlerts.length > 0) {
        toast({
          title: "Critical Alert!",
          description: `${criticalAlerts.length} critical alert(s) detected`,
          variant: "destructive"
        });
      }
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    checkAlerts(); // Initial check
    
    const interval = setInterval(checkAlerts, 30000); // Check every 30 seconds
    setMonitoringInterval(interval);
    
    toast({
      title: "Monitoring Started",
      description: "Real-time monitoring is now active",
      variant: "default"
    });
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      setMonitoringInterval(null);
    }
    
    toast({
      title: "Monitoring Stopped",
      description: "Real-time monitoring has been disabled",
      variant: "default"
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const toggleRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      performance: '⚡',
      error: '❌',
      availability: '🔴',
      security: '🔒'
    };
    return icons[type as keyof typeof icons] || '⚠️';
  };

  const activeAlerts = alerts.filter(a => !a.resolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');

  useEffect(() => {
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  }, [monitoringInterval]);

  return (
    <div className="space-y-6">
      {/* Monitoring Controls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Real-time Monitoring & Alerts
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Continuous monitoring with automated alerting
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              checked={isMonitoring}
              onCheckedChange={isMonitoring ? stopMonitoring : startMonitoring}
            />
            <span className="text-sm">{isMonitoring ? 'Active' : 'Inactive'}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
              <div className="text-xs text-muted-foreground">Critical Alerts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{activeAlerts.length}</div>
              <div className="text-xs text-muted-foreground">Active Alerts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {alertRules.filter(r => r.enabled).length}
              </div>
              <div className="text-xs text-muted-foreground">Enabled Rules</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Active Alerts ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAlerts.slice(0, 10).map((alert) => (
              <Alert key={alert.id} className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getTypeIcon(alert.type)}</span>
                      <span className="font-medium">{alert.title}</span>
                      <Badge className={getSeverityColor(alert.severity)} variant="secondary">
                        {alert.severity}
                      </Badge>
                      {alert.acknowledged && (
                        <Badge variant="outline" className="text-xs">Acknowledged</Badge>
                      )}
                    </div>
                    <AlertDescription>{alert.message}</AlertDescription>
                    <div className="text-xs text-muted-foreground mt-1">
                      {alert.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!alert.acknowledged && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alert Rules Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Alert Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alertRules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Switch 
                  checked={rule.enabled}
                  onCheckedChange={() => toggleRule(rule.id)}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{rule.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {rule.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Threshold: {rule.threshold}{rule.id === 'response-time' ? 'ms' : rule.id === 'error-rate' ? '%' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {rule.enabled ? 
                  <Eye className="h-4 w-4 text-green-500" /> : 
                  <EyeOff className="h-4 w-4 text-gray-400" />
                }
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
