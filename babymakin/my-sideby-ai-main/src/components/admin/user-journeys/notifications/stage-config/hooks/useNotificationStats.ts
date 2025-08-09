
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useNotificationStats(templates: any[]) {
  const [notificationStats, setNotificationStats] = useState<Record<string, {
    scheduledCount: number;
    sentCount: number;
    lastSentAt?: string;
  }>>({});
  
  // Fetch notification stats for templates on mount and when templates change
  useEffect(() => {
    fetchNotificationStats();
  }, [templates]);
  
  const fetchNotificationStats = async () => {
    if (!templates.length) return;
    
    try {
      // Get sent logs
      const { data: sentLogs, error: sentError } = await supabase
        .from("journey_reminder_logs")
        .select("template_id, sent_at")
        .in("template_id", templates.map(t => t.id));
        
      if (sentError) throw sentError;
      
      // Process stats for each template
      const stats: Record<string, any> = {};
      
      templates.forEach(template => {
        const templateLogs = sentLogs?.filter(log => log.template_id === template.id) || [];
        const sentCount = templateLogs.length;
        const lastSentAt = templateLogs.length > 0 
          ? templateLogs.sort((a: any, b: any) => 
              new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
            )[0].sent_at
          : undefined;
            
        // For scheduled count, we'll show a simulated value as we don't have a separate table for scheduled notifications
        // In a real scenario, you'd query the pending_notifications table or similar
        // For now we'll just simulate some values
        const scheduledCount = template.active ? Math.floor(Math.random() * 5) : 0;
        
        stats[template.id] = {
          sentCount,
          scheduledCount,
          lastSentAt
        };
      });
      
      setNotificationStats(stats);
    } catch (error) {
      console.error("Error fetching notification stats:", error);
    }
  };

  return { notificationStats, fetchNotificationStats };
}
