import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookEvent {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, limit = 50 } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (action) {
      case 'health_check':
        return new Response(JSON.stringify(await performHealthCheck(supabase)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'get_events':
        return new Response(JSON.stringify({ events: await getRecentEvents(supabase, limit) }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'test_flow':
        return new Response(JSON.stringify(await testWebhookFlow(supabase)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in webhook health check:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

async function performHealthCheck(supabase: any) {
  console.log('Performing webhook health check...');
  
  try {
    // Create webhook_events table if it doesn't exist
    await ensureWebhookEventsTable(supabase);
    
    // Get recent webhook events
    const { data: events, error } = await supabase
      .from('webhook_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching webhook events:', error);
    }

    const recentEvents = events || [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Check for recent events
    const recentSuccessfulEvents = recentEvents.filter(e => 
      e.status === 'success' && new Date(e.timestamp) > oneHourAgo
    );
    
    const recentFailedEvents = recentEvents.filter(e => 
      e.status === 'error' && new Date(e.timestamp) > oneDayAgo
    );
    
    const lastEventReceived = recentEvents.length > 0 ? recentEvents[0].timestamp : null;
    const consecutiveFailures = getConsecutiveFailures(recentEvents);
    
    // Determine health status
    const isHealthy = recentSuccessfulEvents.length > 0 && consecutiveFailures < 3;
    
    // Generate configuration issues and recommendations
    const configurationIssues = [];
    const recommendations = [];
    
    if (recentEvents.length === 0) {
      configurationIssues.push('No webhook events received');
      recommendations.push('Verify webhook URL is configured in Upduo environment');
      recommendations.push('Check if Upduo is triggering webhooks for conversation.completed events');
    }
    
    if (consecutiveFailures >= 3) {
      configurationIssues.push(`${consecutiveFailures} consecutive webhook failures`);
      recommendations.push('Check webhook processing logic for errors');
      recommendations.push('Verify Upduo session data format compatibility');
    }
    
    if (recentSuccessfulEvents.length === 0 && recentEvents.length > 0) {
      configurationIssues.push('No successful webhook events in the last hour');
      recommendations.push('Check error logs for webhook processing failures');
    }
    
    return {
      isHealthy,
      lastEventReceived,
      consecutiveFailures,
      lastError: recentFailedEvents[0]?.error_message,
      configurationIssues,
      recommendations,
      eventSummary: {
        total: recentEvents.length,
        successful: recentEvents.filter(e => e.status === 'success').length,
        failed: recentEvents.filter(e => e.status === 'error').length,
        recentSuccessful: recentSuccessfulEvents.length,
        recentFailed: recentFailedEvents.length
      }
    };
  } catch (error) {
    console.error('Error in health check:', error);
    return {
      isHealthy: false,
      consecutiveFailures: 0,
      configurationIssues: ['Health check failed: ' + error.message],
      recommendations: ['Check webhook monitoring service deployment and database access']
    };
  }
}

async function getRecentEvents(supabase: any, limit: number): Promise<WebhookEvent[]> {
  try {
    await ensureWebhookEventsTable(supabase);
    
    const { data: events, error } = await supabase
      .from('webhook_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching webhook events:', error);
      return [];
    }

    return events || [];
  } catch (error) {
    console.error('Error in getRecentEvents:', error);
    return [];
  }
}

async function testWebhookFlow(supabase: any) {
  console.log('Testing webhook flow...');
  
  try {
    // This would simulate a webhook call to test the flow
    // For now, we'll just check if the webhook endpoint is accessible
    
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/upduo-webhook`;
    
    // Test OPTIONS request (CORS preflight)
    const optionsResponse = await fetch(webhookUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://api.upduo.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    const corsWorking = optionsResponse.status === 200;
    
    return {
      webhookUrl,
      corsWorking,
      testResults: {
        cors: corsWorking ? 'PASS' : 'FAIL',
        endpoint: 'ACCESSIBLE'
      },
      recommendations: corsWorking 
        ? ['Webhook endpoint is accessible and CORS is configured correctly']
        : ['CORS configuration may need adjustment for Upduo webhook calls']
    };
  } catch (error) {
    console.error('Error testing webhook flow:', error);
    return {
      error: error.message,
      testResults: {
        cors: 'ERROR',
        endpoint: 'ERROR'
      },
      recommendations: ['Check webhook function deployment and network connectivity']
    };
  }
}

function getConsecutiveFailures(events: any[]): number {
  let count = 0;
  for (const event of events) {
    if (event.status === 'error') {
      count++;
    } else {
      break;
    }
  }
  return count;
}

async function ensureWebhookEventsTable(supabase: any) {
  // Create the webhook_events table if it doesn't exist
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS webhook_events (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      event_type TEXT NOT NULL,
      conversation_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('success', 'error')),
      error_message TEXT,
      processing_time INTEGER,
      user_ids TEXT[],
      session_type TEXT,
      metadata JSONB
    );
    
    CREATE INDEX IF NOT EXISTS idx_webhook_events_timestamp ON webhook_events(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
  `;
  
  try {
    await supabase.rpc('exec_sql', { sql: createTableSQL });
  } catch (error) {
    // If rpc doesn't exist, we'll log the error but continue
    console.log('Note: Could not create webhook_events table automatically:', error.message);
  }
}