import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Database,
  Wifi,
  Timer
} from 'lucide-react';
import { useDatabaseMonitoring } from '@/hooks/useDatabaseMonitoring';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const DatabaseHealthDashboard: React.FC = () => {
  const { 
    metrics, 
    queryLogs, 
    healthStatus, 
    recommendations, 
    resetMetrics 
  } = useDatabaseMonitoring();
  
  const { isOnline, isSlowConnection, connectionType, effectiveType } = useNetworkStatus();

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'warning': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded': 
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const errorRate = metrics.queryCount > 0 ? (metrics.errorCount / metrics.queryCount) * 100 : 0;
  const timeoutRate = metrics.queryCount > 0 ? (metrics.timeoutCount / metrics.queryCount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-semantic-text-primary">Database Health</h2>
          <p className="text-semantic-text-secondary">Monitor database performance and connectivity</p>
        </div>
        <Button onClick={resetMetrics} variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Metrics
        </Button>
      </div>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-lg font-semibold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </div>
              <div className="text-sm text-semantic-text-secondary">Connection</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-semibold ${isSlowConnection ? 'text-orange-600' : 'text-green-600'}`}>
                {isSlowConnection ? 'Slow' : 'Fast'}
              </div>
              <div className="text-sm text-semantic-text-secondary">Speed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-semantic-text-primary">
                {connectionType || 'Unknown'}
              </div>
              <div className="text-sm text-semantic-text-secondary">Type</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-semantic-text-primary">
                {effectiveType || 'Unknown'}
              </div>
              <div className="text-sm text-semantic-text-secondary">Effective Type</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            {getHealthIcon(healthStatus)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(healthStatus)}`}>
              {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Database className="h-4 w-4 text-semantic-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">{metrics.queryCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Timer className="h-4 w-4 text-semantic-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {Math.round(metrics.avgResponseTime)}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timeout Rate</CardTitle>
            <Clock className="h-4 w-4 text-semantic-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {timeoutRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Error Metrics</CardTitle>
          <CardDescription>Database query success and failure rates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Error Rate</span>
              <span>{errorRate.toFixed(1)}%</span>
            </div>
            <Progress value={errorRate} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Timeout Rate</span>
              <span>{timeoutRate.toFixed(1)}%</span>
            </div>
            <Progress value={timeoutRate} className="h-2" />
          </div>
          {metrics.lastTimeout && (
            <div className="text-sm text-semantic-text-secondary">
              Last timeout: {metrics.lastTimeout.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Performance Recommendations:</div>
            <ul className="list-disc list-inside space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-sm">{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Query Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Query Logs</CardTitle>
          <CardDescription>Last 10 database operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {queryLogs.length === 0 ? (
              <div className="text-sm text-semantic-text-secondary">No recent queries</div>
            ) : (
              queryLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-semantic-border last:border-b-0">
                  <div className="flex items-center gap-2">
                    {log.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">{log.operation}</span>
                    {log.timeout && (
                      <Badge variant="destructive" className="text-xs">Timeout</Badge>
                    )}
                  </div>
                  <div className="text-sm text-semantic-text-secondary">
                    {log.endTime && `${log.endTime - log.startTime}ms`}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};