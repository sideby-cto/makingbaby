import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueueEntry {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  crew_code: string | null;
  attempts: number;
  max_attempts: number;
  next_retry_at: string;
  metadata: any;
}

interface ProcessingResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  duration: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('Starting Upduo queue processing...');

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending queue entries that are ready for processing
    const { data: queueEntries, error: fetchError } = await supabase
      .from('upduo_integration_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('next_retry_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(10); // Process in batches of 10

    if (fetchError) {
      console.error('Failed to fetch queue entries:', fetchError);
      throw fetchError;
    }

    const result: ProcessingResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
      duration: 0
    };

    console.log(`Found ${queueEntries?.length || 0} queue entries to process`);

    if (!queueEntries || queueEntries.length === 0) {
      result.duration = Date.now() - startTime;
      return new Response(JSON.stringify({
        message: 'No pending queue entries found',
        result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Process each queue entry
    for (const entry of queueEntries as QueueEntry[]) {
      try {
        console.log(`Processing queue entry ${entry.id} for user ${entry.user_id}`);

        // Mark as processing
        await supabase
          .from('upduo_integration_queue')
          .update({ 
            status: 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', entry.id);

        // Call the existing Upduo integration function
        const { data: integrationResult, error: integrationError } = await supabase.functions.invoke(
          'upduo-integration',
          {
            body: {
              firstName: entry.first_name,
              lastName: entry.last_name,
              email: entry.email,
              crewCode: entry.crew_code
            }
          }
        );

        if (integrationError) {
          throw integrationError;
        }

        // Mark as completed
        await supabase
          .from('upduo_integration_queue')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', entry.id);

        console.log(`Successfully processed queue entry ${entry.id}`);
        result.processed++;

      } catch (error: any) {
        console.error(`Failed to process queue entry ${entry.id}:`, error);
        
        const newAttempts = entry.attempts + 1;
        const maxAttempts = entry.max_attempts || 3;
        
        if (newAttempts >= maxAttempts) {
          // Mark as failed after max attempts
          await supabase
            .from('upduo_integration_queue')
            .update({
              status: 'failed',
              attempts: newAttempts,
              error_message: error.message,
              updated_at: new Date().toISOString()
            })
            .eq('id', entry.id);
          
          console.log(`Queue entry ${entry.id} marked as failed after ${newAttempts} attempts`);
        } else {
          // Schedule retry with exponential backoff
          const retryDelayMs = Math.min(1000 * Math.pow(2, newAttempts), 300000); // Max 5 minutes
          const nextRetryAt = new Date(Date.now() + retryDelayMs);
          
          await supabase
            .from('upduo_integration_queue')
            .update({
              status: 'pending',
              attempts: newAttempts,
              next_retry_at: nextRetryAt.toISOString(),
              error_message: error.message,
              updated_at: new Date().toISOString()
            })
            .eq('id', entry.id);
          
          console.log(`Queue entry ${entry.id} scheduled for retry at ${nextRetryAt.toISOString()}`);
        }

        result.failed++;
        result.errors.push(`Entry ${entry.id}: ${error.message}`);
      }
    }

    result.duration = Date.now() - startTime;
    console.log(`Queue processing completed: ${result.processed} processed, ${result.failed} failed, ${result.duration}ms`);

    return new Response(JSON.stringify({
      message: 'Queue processing completed',
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Queue processing failed:', error);
    
    const duration = Date.now() - startTime;
    return new Response(JSON.stringify({
      error: 'Queue processing failed',
      message: error.message,
      duration
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});