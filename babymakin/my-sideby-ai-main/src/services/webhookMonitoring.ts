import { supabase } from "@/integrations/supabase/client";

export interface WebhookHealthStatus {
  isHealthy: boolean;
  lastEventReceived?: string;
  consecutiveFailures: number;
  lastError?: string;
  configurationIssues: string[];
  recommendations: string[];
}

export interface WebhookEvent {
  id: string;
  timestamp: string;
  event_type: string;
  conversation_id: string;
  status: 'success' | 'error';
  error_message?: string;
  processing_time?: number;
  user_ids?: string[];
  session_type?: string;
}

export const checkWebhookHealth = async (): Promise<WebhookHealthStatus> => {
  try {
    console.log('Checking webhook health...');
    
    // Get recent webhook events from edge function logs
    const { data: recentEvents, error } = await supabase.functions.invoke('webhook-health-check', {
      body: { action: 'health_check' }
    });

    if (error) {
      console.error('Error checking webhook health:', error);
      return {
        isHealthy: false,
        consecutiveFailures: 0,
        configurationIssues: ['Unable to connect to webhook monitoring service'],
        recommendations: ['Check if webhook monitoring function is deployed']
      };
    }

    return recentEvents || {
      isHealthy: false,
      consecutiveFailures: 0,
      configurationIssues: ['No webhook events detected'],
      recommendations: ['Verify webhook URL configuration in Upduo']
    };
    
  } catch (error) {
    console.error('Error in checkWebhookHealth:', error);
    return {
      isHealthy: false,
      consecutiveFailures: 0,
      configurationIssues: ['Webhook health check failed'],
      recommendations: ['Check network connectivity and function deployment']
    };
  }
};

export const getWebhookEvents = async (limit: number = 50): Promise<WebhookEvent[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('webhook-health-check', {
      body: { action: 'get_events', limit }
    });

    if (error) {
      console.error('Error fetching webhook events:', error);
      return [];
    }

    return data?.events || [];
  } catch (error) {
    console.error('Error in getWebhookEvents:', error);
    return [];
  }
};

export const testWebhookFlow = async () => {
  try {
    console.log('Testing webhook flow...');
    
    const { data, error } = await supabase.functions.invoke('webhook-health-check', {
      body: { action: 'test_flow' }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error testing webhook flow:', error);
    throw error;
  }
};

export const sendFallbackNotification = async (sessionData: any, userIds: string[]) => {
  try {
    console.log('Sending fallback notification for manual transcript storage...');
    
    const { data, error } = await supabase.functions.invoke('slack-notification', {
      body: {
        type: 'session_completed',
        session: sessionData,
        user_ids: userIds,
        timestamp: new Date().toISOString(),
        fallback: true
      }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error sending fallback notification:', error);
    throw error;
  }
};