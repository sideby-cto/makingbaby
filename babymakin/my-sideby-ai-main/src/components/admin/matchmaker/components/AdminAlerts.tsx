
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { OverdueUser, useOverdueMatches } from "@/components/dashboard/scheduling/hooks/useOverdueMatches";

type AdminAlert = {
  id: string;
  match_id: string;
  user_id: string;
  content: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  user_name?: string;
  partner_name?: string;
  matches?: { id: string; user1_id: string; user2_id: string; };
  alert_type?: 'help_request' | 'overdue_match';
};

export const AdminAlerts = () => {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  // Reduce threshold to 7 days to increase chances of seeing overdue alerts
  const { overdueUsers, loading: overdueLoading, error: overdueError } = useOverdueMatches(7); 

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      console.log('Fetching admin alerts');
      
      // Fetch regular help request alerts
      const { data: helpAlerts, error: helpError } = await supabase
        .from('admin_alerts')
        .select(`
          *,
          matches(id, user1_id, user2_id)
        `)
        .eq('status', 'pending');

      if (helpError) throw helpError;
      
      console.log('Help alerts fetched:', helpAlerts);
      
      // Process help request alerts
      const helpAlertsWithNames = await Promise.all(
        (helpAlerts || []).map(async (alert) => {
          const match = alert.matches;
          
          const { data: userData } = await supabase
            .from('profiles')
            .select('first_name, id')
            .in('id', [match.user1_id, match.user2_id]);
          
          if (!userData) return alert as AdminAlert;
          
          const user = userData.find(u => u.id === alert.user_id);
          const partner = userData.find(u => u.id !== alert.user_id);
          
          return {
            ...alert,
            user_name: user?.first_name || 'User',
            partner_name: partner?.first_name || 'Partner',
            status: alert.status as 'pending' | 'resolved' | 'dismissed',
            alert_type: 'help_request'
          } as AdminAlert;
        })
      );

      console.log('Processed help alerts:', helpAlertsWithNames);
      console.log('Overdue users from hook:', overdueUsers);

      // Transform overdue users to match AdminAlert format
      const overdueAlerts: AdminAlert[] = overdueUsers ? overdueUsers.map(user => {
        return {
          id: `overdue-${user.id}`,
          match_id: '',
          user_id: user.id,
          content: `User has been waiting for a match for ${user.days_since_registration} days`,
          status: 'pending' as const,
          created_at: new Date().toISOString(),
          user_name: user.first_name || 'User',
          alert_type: 'overdue_match' as const
        };
      }) : [];
      
      const allAlerts = [...helpAlertsWithNames, ...overdueAlerts];
      console.log('Admin alerts loaded:', allAlerts.length);
      setAlerts(allAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast({
        title: "Error",
        description: "Failed to load admin alerts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    // Create a unique channel name with timestamp
    const timestamp = new Date().getTime();
    console.log('Setting up admin alerts subscription');
    
    const channel = supabase
      .channel(`admin_alerts_${timestamp}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_alerts',
        },
        (payload) => {
          console.log('Admin alert change detected:', payload);
          fetchAlerts(); // Reload all alerts when any change is detected
        }
      )
      .subscribe((status) => {
        console.log('Admin alerts subscription status:', status);
      });

    return () => {
      console.log('Cleaning up admin alerts subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  // Re-fetch when overdue users change
  useEffect(() => {
    if (!overdueLoading) {
      console.log('Overdue users changed, re-fetching alerts');
      fetchAlerts();
    }
  }, [overdueUsers, overdueLoading]);

  const handleAlertAction = async (alertId: string, action: 'resolve' | 'dismiss') => {
    try {
      // For regular alerts stored in the database
      if (!alertId.startsWith('overdue-')) {
        const { error } = await supabase
          .from('admin_alerts')
          .update({ status: action === 'resolve' ? 'resolved' : 'dismissed' })
          .eq('id', alertId);

        if (error) throw error;
      }

      // Remove the alert from local state
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      
      toast({
        title: action === 'resolve' ? "Alert resolved" : "Alert dismissed",
        description: action === 'resolve' 
          ? "The alert has been marked as resolved." 
          : "The alert has been dismissed.",
      });
    } catch (error) {
      console.error(`Error ${action}ing alert:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} the alert.`,
        variant: "destructive",
      });
    }
  };

  const handleViewConversation = (matchId: string) => {
    navigate(`/admin/matchmaker?match=${matchId}`);
  };
  
  const handleMatchUser = (userId: string) => {
    navigate(`/admin/matchmaker?focus=${userId}`);
  };

  if (loading) {
    return <div className="py-4 text-center text-gray-500">Loading alerts...</div>;
  }

  // Debug output instead of returning null when no alerts
  if (alerts.length === 0) {
    console.log('No alerts found. Debug info:', {
      overdueUsers: overdueUsers?.length || 0,
      overdueLoading,
      overdueError,
    });
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      <h2 className="text-xl font-semibold">Alerts</h2>
      {alerts.map((alert) => {
        const isHelpRequest = alert.alert_type === 'help_request' || !alert.alert_type;
        const isOverdueMatch = alert.alert_type === 'overdue_match';
        
        return (
          <Alert 
            key={alert.id} 
            variant={isHelpRequest ? "destructive" : "default"}
            className={isHelpRequest ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}
          >
            {isHelpRequest ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <Clock className="h-5 w-5 text-yellow-600" />
            )}
            <div className="flex-1">
              <AlertTitle className={`flex items-center justify-between ${isHelpRequest ? "text-red-800" : "text-yellow-800"}`}>
                <span>
                  {isHelpRequest 
                    ? `Help request from ${alert.user_name}` 
                    : `Overdue match for ${alert.user_name}`}
                </span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className={`h-8 bg-white ${isHelpRequest ? "text-green-600 border-green-300 hover:bg-green-50" : "text-yellow-600 border-yellow-300 hover:bg-yellow-50"}`}
                    onClick={() => handleAlertAction(alert.id, 'resolve')}
                  >
                    <Check className="mr-1 h-4 w-4" /> Resolve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 bg-white text-gray-600 border-gray-300 hover:bg-gray-50" 
                    onClick={() => handleAlertAction(alert.id, 'dismiss')}
                  >
                    <X className="mr-1 h-4 w-4" /> Dismiss
                  </Button>
                </div>
              </AlertTitle>
              <AlertDescription className={isHelpRequest ? "text-red-800" : "text-yellow-800"}>
                <p className="mb-1">
                  <strong>Message:</strong> {alert.content}
                </p>
                {isHelpRequest && (
                  <p className="mb-1">
                    <strong>Match:</strong> {alert.user_name} and {alert.partner_name}
                  </p>
                )}
                <div className="mt-2">
                  {isHelpRequest ? (
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-blue-600 hover:underline"
                      onClick={() => handleViewConversation(alert.match_id)}
                    >
                      View conversation
                    </Button>
                  ) : (
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-blue-600 hover:underline"
                      onClick={() => handleMatchUser(alert.user_id)}
                    >
                      Match this user
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </div>
          </Alert>
        );
      })}
    </div>
  );
};
