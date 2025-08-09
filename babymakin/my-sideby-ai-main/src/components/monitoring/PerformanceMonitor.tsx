import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { Activity, Wifi, WifiOff, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface PerformanceAlert {
  id: string;
  type: 'performance' | 'connection' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export const PerformanceMonitor = () => {
  const { getAverageRenderTime, renderCount } = usePerformanceMonitor('PerformanceMonitor');
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [pageLoadTime, setPageLoadTime] = useState<number>(0);
  const [wsErrors, setWsErrors] = useState<number>(0);

  useEffect(() => {
    // Monitor page load performance
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    setPageLoadTime(loadTime);

    // Check for slow page loads
    if (loadTime > 10000) { // 10 seconds
      addAlert({
        type: 'performance',
        severity: 'critical',
        message: `Extremely slow page load detected: ${(loadTime / 1000).toFixed(2)}s`,
        resolved: false
      });
    } else if (loadTime > 5000) { // 5 seconds
      addAlert({
        type: 'performance',
        severity: 'high',
        message: `Slow page load detected: ${(loadTime / 1000).toFixed(2)}s`,
        resolved: false
      });
    }

    // Monitor WebSocket connections
    const checkWebSocketConnection = () => {
      // Check if Supabase WebSocket is connected
      const supabaseStatus = (window as any).supabase?.realtime?.channels?.size > 0 ? 'connected' : 'disconnected';
      setConnectionStatus(supabaseStatus);

      // Monitor console for WebSocket errors
      const originalError = console.error;
      console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('websocket') || message.includes('CHANNEL_ERROR')) {
          setWsErrors(prev => prev + 1);
          
          if (wsErrors > 5) {
            addAlert({
              type: 'connection',
              severity: 'critical',
              message: `Multiple WebSocket connection failures detected (${wsErrors} errors)`,
              resolved: false
            });
          }
        }
        originalError.apply(console, args);
      };

      return () => {
        console.error = originalError;
      };
    };

    const cleanup = checkWebSocketConnection();
    const interval = setInterval(checkWebSocketConnection, 5000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [wsErrors]);

  const addAlert = (alertData: Omit<PerformanceAlert, 'id' | 'timestamp'>) => {
    const alert: PerformanceAlert = {
      ...alertData,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, resolved: true } : alert
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Clock className="h-4 w-4" />;
      case 'connection': return <WifiOff className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Page Load Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(pageLoadTime / 1000).toFixed(2)}s
            </div>
            <Progress 
              value={Math.min((pageLoadTime / 10000) * 100, 100)} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt;3s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {connectionStatus === 'connected' ? 
                <Wifi className="h-4 w-4 text-green-500" /> : 
                <WifiOff className="h-4 w-4 text-red-500" />
              }
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge 
                variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
                className="capitalize"
              >
                {connectionStatus}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              WebSocket Errors: {wsErrors}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Render Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getAverageRenderTime().toFixed(1)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {renderCount} renders
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Performance Alerts
          </CardTitle>
          <CardDescription>
            Real-time monitoring alerts for performance and connectivity issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={!alert.resolved ? 'border-orange-200' : 'border-gray-200'}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <AlertDescription className={alert.resolved ? 'line-through text-muted-foreground' : ''}>
                          {alert.message}
                        </AlertDescription>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => resolveAlert(alert.id)}
                        aria-label="Resolve alert"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </Alert>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              No performance alerts
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};