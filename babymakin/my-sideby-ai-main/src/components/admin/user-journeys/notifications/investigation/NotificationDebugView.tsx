
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Search, User, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DebugData {
  pendingNotifications: any[];
  journeyEvents: any[];
  deliveryLogs: any[];
  emailLogs: any[];
  userProfiles: any[];
}

export function NotificationDebugView() {
  const [debugData, setDebugData] = useState<DebugData>({
    pendingNotifications: [],
    journeyEvents: [],
    deliveryLogs: [],
    emailLogs: [],
    userProfiles: []
  });
  const [loading, setLoading] = useState(false);
  const [userFilter, setUserFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadDebugData();
  }, []);

  const loadDebugData = async () => {
    setLoading(true);
    try {
      const timeframe = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Load pending notifications
      const { data: pending } = await supabase
        .from('pending_notifications')
        .select(`
          *,
          profiles!pending_notifications_user_id_fkey(email, first_name, last_name)
        `)
        .gte('created_at', timeframe)
        .order('created_at', { ascending: false })
        .limit(100);

      // Load recent journey events
      const { data: events } = await supabase
        .from('user_journey_events')
        .select(`
          *,
          profiles!user_journey_events_user_id_fkey(email, first_name, last_name)
        `)
        .gte('created_at', timeframe)
        .order('created_at', { ascending: false })
        .limit(50);

      // Load delivery logs
      const { data: delivery } = await supabase
        .from('notification_delivery_logs')
        .select('*')
        .gte('created_at', timeframe)
        .order('created_at', { ascending: false })
        .limit(100);

      // Load email send logs
      const { data: emails } = await supabase
        .from('email_send_logs')
        .select('*')
        .gte('created_at', timeframe)
        .order('created_at', { ascending: false })
        .limit(50);

      // Load user profiles with recent activity
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, journey_stage, created_at, updated_at')
        .gte('updated_at', timeframe)
        .order('updated_at', { ascending: false })
        .limit(20);

      setDebugData({
        pendingNotifications: pending || [],
        journeyEvents: events || [],
        deliveryLogs: delivery || [],
        emailLogs: emails || [],
        userProfiles: profiles || []
      });

    } catch (error) {
      console.error('Error loading debug data:', error);
      toast({
        title: "Error loading debug data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "secondary",
      sent: "default",
      failed: "destructive",
      processed: "default"
    };
    return <Badge variant={colors[status] || "outline"}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredNotifications = debugData.pendingNotifications.filter(n => {
    if (userFilter && !n.profiles?.email?.includes(userFilter)) return false;
    if (dateFilter && !n.created_at.startsWith(dateFilter)) return false;
    return true;
  });

  const filteredEvents = debugData.journeyEvents.filter(e => {
    if (userFilter && !e.profiles?.email?.includes(userFilter)) return false;
    if (dateFilter && !e.created_at.startsWith(dateFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Notification Debug Console
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="user-filter">User Email Filter</Label>
              <Input
                id="user-filter"
                placeholder="Enter email to filter..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="date-filter">Date Filter (YYYY-MM-DD)</Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={loadDebugData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({filteredNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="events">
                Journey Events ({filteredEvents.length})
              </TabsTrigger>
              <TabsTrigger value="delivery">
                Delivery Logs ({debugData.deliveryLogs.length})
              </TabsTrigger>
              <TabsTrigger value="emails">
                Email Logs ({debugData.emailLogs.length})
              </TabsTrigger>
              <TabsTrigger value="users">
                Recent Users ({debugData.userProfiles.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <Card key={notification.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <strong className="text-sm">{notification.title}</strong>
                            {getStatusBadge(notification.status)}
                          </div>
                          <Badge variant="outline">{notification.channel}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.content}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <span>User: {notification.profiles?.email || 'Unknown'}</span>
                          <span>Type: {notification.notification_type}</span>
                          <span>Created: {formatDate(notification.created_at)}</span>
                          <span>Processed: {notification.processed_at ? formatDate(notification.processed_at) : 'No'}</span>
                        </div>
                        {notification.data && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer">Data</summary>
                            <pre className="text-xs bg-gray-50 p-2 rounded mt-1">
                              {JSON.stringify(notification.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="events">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredEvents.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <strong className="text-sm">Stage Change</strong>
                          </div>
                          <Badge variant="outline">
                            {event.previous_stage} → {event.new_stage}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <span>User: {event.profiles?.email || 'Unknown'}</span>
                          <span>Created: {formatDate(event.created_at)}</span>
                        </div>
                        {event.metadata && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer">Metadata</summary>
                            <pre className="text-xs bg-gray-50 p-2 rounded mt-1">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="delivery">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {debugData.deliveryLogs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <strong className="text-sm">Delivery Attempt</strong>
                            {getStatusBadge(log.success ? 'sent' : 'failed')}
                          </div>
                          <Badge variant="outline">{log.channel}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <span>Notification ID: {log.notification_id}</span>
                          <span>Attempts: {log.attempt_count}</span>
                          <span>Last Attempt: {formatDate(log.last_attempt_at)}</span>
                          <span>Source: {log.source_table}</span>
                        </div>
                        {log.error && (
                          <p className="text-xs text-red-600 mt-2">Error: {log.error}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="emails">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {debugData.emailLogs.map((email) => (
                    <Card key={email.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <strong className="text-sm">{email.subject}</strong>
                            {getStatusBadge(email.status)}
                          </div>
                          <Badge variant="outline">{email.account_type}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <span>To: {email.recipient_email}</span>
                          <span>Template: {email.template_id || 'None'}</span>
                          <span>Created: {formatDate(email.created_at)}</span>
                          <span>Sent: {email.sent_at ? formatDate(email.sent_at) : 'No'}</span>
                        </div>
                        {email.error_message && (
                          <p className="text-xs text-red-600 mt-2">Error: {email.error_message}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="users">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {debugData.userProfiles.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <strong className="text-sm">{user.first_name} {user.last_name}</strong>
                          </div>
                          <Badge variant="outline">{user.journey_stage}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <span>Email: {user.email}</span>
                          <span>Created: {formatDate(user.created_at)}</span>
                          <span>Updated: {formatDate(user.updated_at)}</span>
                          <span>ID: {user.id}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
