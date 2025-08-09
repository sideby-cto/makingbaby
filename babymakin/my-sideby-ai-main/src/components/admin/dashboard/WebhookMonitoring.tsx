import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { checkWebhookHealth, getWebhookEvents, testWebhookFlow, WebhookHealthStatus, WebhookEvent } from '@/services/webhookMonitoring';
import { RefreshCw, Activity, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { formatDistance } from 'date-fns';

export const WebhookMonitoring = () => {
  const [healthStatus, setHealthStatus] = useState<WebhookHealthStatus | null>(null);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [health, events] = await Promise.all([
        checkWebhookHealth(),
        getWebhookEvents(50)
      ]);
      
      setHealthStatus(health);
      setWebhookEvents(events);
    } catch (error) {
      console.error('Error fetching webhook monitoring data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch webhook monitoring data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    try {
      setTesting(true);
      const result = await testWebhookFlow();
      
      toast({
        title: "Webhook Test Complete",
        description: `Test results: ${JSON.stringify(result.testResults)}`,
      });
      
      // Refresh data after test
      await fetchData();
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast({
        title: "Test Failed",
        description: "Failed to test webhook flow",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (isHealthy: boolean) => (
    <Badge variant={isHealthy ? "default" : "destructive"} className="ml-2">
      {isHealthy ? (
        <>
          <CheckCircle className="w-3 h-3 mr-1" />
          Healthy
        </>
      ) : (
        <>
          <AlertTriangle className="w-3 h-3 mr-1" />
          Issues
        </>
      )}
    </Badge>
  );

  const getEventStatusIcon = (status: string) => {
    return status === 'success' ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Webhook Health Status
              {healthStatus && getStatusBadge(healthStatus.isHealthy)}
            </CardTitle>
            <CardDescription>
              Monitor Upduo webhook events and delivery status
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleTestWebhook} variant="outline" size="sm" disabled={testing}>
              <Zap className="w-4 h-4 mr-2" />
              {testing ? 'Testing...' : 'Test Flow'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {healthStatus && (
            <div className="space-y-4">
              {/* Health Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Event</span>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">
                    {healthStatus.lastEventReceived 
                      ? formatDistance(new Date(healthStatus.lastEventReceived), new Date(), { addSuffix: true })
                      : 'Never'
                    }
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Consecutive Failures</span>
                    <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold text-red-500">
                    {healthStatus.consecutiveFailures}
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Status</span>
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">
                    {healthStatus.isHealthy ? (
                      <span className="text-green-500">Healthy</span>
                    ) : (
                      <span className="text-red-500">Issues</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Configuration Issues */}
              {healthStatus.configurationIssues.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Configuration Issues:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {healthStatus.configurationIssues.map((issue, index) => (
                        <li key={index} className="text-sm">{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Recommendations */}
              {healthStatus.recommendations.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Recommendations:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {healthStatus.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Webhook Events</CardTitle>
          <CardDescription>
            Last 50 webhook events received from Upduo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="events" className="w-full">
            <TabsList>
              <TabsTrigger value="events">Event Log</TabsTrigger>
              <TabsTrigger value="debug">Debug Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="space-y-4">
              {webhookEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No webhook events recorded</p>
                  <p className="text-sm">Check webhook configuration in Upduo</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {webhookEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        {getEventStatusIcon(event.status)}
                        <div>
                          <div className="font-medium">{event.event_type}</div>
                          <div className="text-sm text-muted-foreground">
                            Session: {event.conversation_id}
                          </div>
                          {event.error_message && (
                            <div className="text-sm text-red-500">{event.error_message}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {formatDistance(new Date(event.timestamp), new Date(), { addSuffix: true })}
                        </div>
                        {event.processing_time && (
                          <div className="text-xs text-muted-foreground">
                            {event.processing_time}ms
                          </div>
                        )}
                        {event.session_type && (
                          <Badge variant="outline" className="text-xs">
                            {event.session_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="debug" className="space-y-4">
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Webhook URL Configuration:</div>
                  <code className="text-sm bg-muted p-2 rounded block">
                    {`${window.location.origin.replace(/:\d+$/, '')}/functions/v1/upduo-webhook`}
                  </code>
                  <div className="mt-2 text-sm">
                    This URL should be configured in your Upduo environment to receive conversation.completed events.
                  </div>
                </AlertDescription>
              </Alert>
              
              {healthStatus && (
                <div className="space-y-2">
                  <div className="font-medium">Debug Information:</div>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {JSON.stringify(healthStatus, null, 2)}
                  </pre>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};