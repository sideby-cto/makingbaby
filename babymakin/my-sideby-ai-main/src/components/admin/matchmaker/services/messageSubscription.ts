import { supabase } from "@/integrations/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type MessageRow = {
  id: string;
  match_id: string;
  content: string;
  sender_id: string;
  created_at: string;
  updated_at: string;
};

type AlertRow = {
  id: string;
  match_id: string;
  user_id: string;
  content: string;
  status: string;
  created_at: string;
};

// Keep track of active subscriptions to avoid duplicates
const activeSubscriptions = new Set<string>();

export const setupMessageSubscriptions = (
  onMessageChange: (matchId: string) => void
) => {
  // Create stable channel names for each subscription type to prevent duplicates
  const schedulingChannelName = `admin_scheduling_messages_monitor`;
  const adminChannelName = `admin_admin_messages_monitor`;
  const alertsChannelName = `admin_alerts_monitor`;
  
  // Don't set up duplicated subscriptions
  if (activeSubscriptions.has(schedulingChannelName) || 
      activeSubscriptions.has(adminChannelName) || 
      activeSubscriptions.has(alertsChannelName)) {
    console.log("Message subscriptions already active, not creating new ones");
    return () => {};
  }
  
  // Clean up any existing channels with these names
  supabase.getChannels()
    .filter(ch => [schedulingChannelName, adminChannelName, alertsChannelName].includes(ch.topic))
    .forEach(ch => supabase.removeChannel(ch));
  
  console.log("Setting up admin message subscriptions");
  
  const schedulingChannel = supabase
    .channel(schedulingChannelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'match_scheduling_messages'
      },
      (payload: RealtimePostgresChangesPayload<MessageRow>) => {
        console.log("Scheduling message change detected:", payload);
        const newRow = payload.new as MessageRow;
        if (newRow && typeof newRow === 'object' && 'match_id' in newRow) {
          onMessageChange(newRow.match_id);
        }
      }
    )
    .subscribe((status) => {
      console.log('Admin scheduling message monitor subscription status:', status);
      if (status === 'SUBSCRIBED') {
        activeSubscriptions.add(schedulingChannelName);
      }
    });

  const adminChannel = supabase
    .channel(adminChannelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'match_admin_messages'
      },
      (payload: RealtimePostgresChangesPayload<MessageRow>) => {
        console.log("Admin message change detected:", payload);
        const newRow = payload.new as MessageRow;
        if (newRow && typeof newRow === 'object' && 'match_id' in newRow) {
          onMessageChange(newRow.match_id);
        }
      }
    )
    .subscribe((status) => {
      console.log('Admin messages monitor subscription status:', status);
      if (status === 'SUBSCRIBED') {
        activeSubscriptions.add(adminChannelName);
      }
    });

  // Add subscription for admin alerts
  const alertsChannel = supabase
    .channel(alertsChannelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'admin_alerts'
      },
      (payload: RealtimePostgresChangesPayload<AlertRow>) => {
        console.log("Admin alert change detected:", payload);
        const newRow = payload.new as AlertRow;
        if (newRow && typeof newRow === 'object' && 'match_id' in newRow) {
          onMessageChange(newRow.match_id);
        }
      }
    )
    .subscribe((status) => {
      console.log('Admin alerts monitor subscription status:', status);
      if (status === 'SUBSCRIBED') {
        activeSubscriptions.add(alertsChannelName);
      }
    });

  return () => {
    if (activeSubscriptions.has(schedulingChannelName)) {
      console.log("Cleaning up scheduling message subscription");
      supabase.removeChannel(schedulingChannel);
      activeSubscriptions.delete(schedulingChannelName);
    }
    
    if (activeSubscriptions.has(adminChannelName)) {
      console.log("Cleaning up admin message subscription");
      supabase.removeChannel(adminChannel);
      activeSubscriptions.delete(adminChannelName);
    }
    
    if (activeSubscriptions.has(alertsChannelName)) {
      console.log("Cleaning up alerts subscription");
      supabase.removeChannel(alertsChannel);
      activeSubscriptions.delete(alertsChannelName);
    }
  };
};
