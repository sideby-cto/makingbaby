
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NotifiedUserData } from "../management/NotifiedUsersList";

export const useNotifiedUsers = () => {
  const {
    data: notifiedUsers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["journey-notified-users"],
    queryFn: async (): Promise<NotifiedUserData[]> => {
      try {
        // Fetch notifications sent data
        const { data: reminderLogs, error: logsError } = await supabase
          .from("journey_reminder_logs")
          .select(`
            id,
            user_id,
            stage,
            reminder_type,
            sent_at,
            success,
            notification_id
          `)
          .order("sent_at", { ascending: false })
          .limit(100);

        if (logsError) throw logsError;

        // Get user info for the notification recipients
        const userIds = reminderLogs.map(log => log.user_id);
        
        // Fetch scheduled notifications from pending_notifications table
        const { data: pendingNotifications, error: pendingError } = await supabase
          .from("pending_notifications")
          .select(`
            id, 
            user_id, 
            notification_type,
            data,
            created_at
          `)
          .eq("notification_type", "journey_notification")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(50);
        
        if (pendingError) throw pendingError;
        
        // Add pending notification user IDs to our list
        if (pendingNotifications?.length) {
          pendingNotifications.forEach(notification => {
            if (!userIds.includes(notification.user_id)) {
              userIds.push(notification.user_id);
            }
          });
        }
        
        // Get all user profiles in one query
        const { data: userProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", userIds);

        if (profilesError) throw profilesError;
        
        // Map reminder logs to our expected format
        const sentNotifications = reminderLogs.map((log): NotifiedUserData => {
          const userProfile = userProfiles.find(p => p.id === log.user_id);
          
          return {
            id: log.id,
            userId: log.user_id,
            firstName: userProfile?.first_name || 'Unknown',
            lastName: userProfile?.last_name || 'User',
            email: userProfile?.email || 'unknown@email.com',
            stage: log.stage || 'unknown',
            reminderType: log.reminder_type || 'unknown',
            status: log.success ? 'sent' : 'failed',
            sentAt: log.sent_at,
            scheduled: false
          };
        });
        
        // Map pending notifications
        const scheduledNotifications = pendingNotifications?.map((notification): NotifiedUserData => {
          const userProfile = userProfiles.find(p => p.id === notification.user_id);
          const data = notification.data as any;
          
          return {
            id: notification.id,
            userId: notification.user_id,
            firstName: userProfile?.first_name || 'Unknown',
            lastName: userProfile?.last_name || 'User',
            email: userProfile?.email || 'unknown@email.com',
            stage: data?.stage || 'unknown',
            reminderType: data?.reminder_type || 'unknown',
            status: 'pending',
            scheduled: true,
            // Represent creation time as sent time for sorting purposes
            sentAt: notification.created_at
          };
        }) || [];
        
        // Combine both sets of data
        return [...scheduledNotifications, ...sentNotifications];
      } catch (error) {
        console.error("Error fetching notified users:", error);
        throw error;
      }
    },
  });

  return {
    notifiedUsers,
    isLoading,
    error,
    refetchUsers: refetch,
  };
};
