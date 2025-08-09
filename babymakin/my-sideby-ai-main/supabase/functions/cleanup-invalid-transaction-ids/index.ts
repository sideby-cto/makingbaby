import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting cleanup of invalid transaction IDs...');

    // Check if signup_transaction_logs table exists
    let hasSignupLogs = false;
    try {
      const { data: testData, error: testError } = await supabaseClient
        .from('signup_transaction_logs')
        .select('id')
        .limit(1);
      
      if (!testError) {
        hasSignupLogs = true;
      }
    } catch (e) {
      console.log('signup_transaction_logs table not available');
    }

    // Check if upduo_integration_queue table exists
    let hasUpdouQueue = false;
    try {
      const { data: testData, error: testError } = await supabaseClient
        .from('upduo_integration_queue')
        .select('id')
        .limit(1);
      
      if (!testError) {
        hasUpdouQueue = true;
      }
    } catch (e) {
      console.log('upduo_integration_queue table not available');
    }

    const results = {
      signupLogs: { checked: hasSignupLogs, invalid: 0, fixed: 0 },
      upduoQueue: { checked: hasUpdouQueue, invalid: 0, fixed: 0 }
    };

    // Function to validate UUID format
    const isValidUUID = (uuid: string): boolean => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    };

    // Function to generate a proper UUID
    const generateUUID = (): string => {
      return crypto.randomUUID();
    };

    // Clean up signup_transaction_logs if it exists
    if (hasSignupLogs) {
      console.log('Checking signup_transaction_logs for invalid transaction_ids...');
      
      const { data: signupLogs, error: fetchError } = await supabaseClient
        .from('signup_transaction_logs')
        .select('id, transaction_id')
        .limit(1000); // Process in batches

      if (fetchError) {
        console.error('Error fetching signup logs:', fetchError);
      } else if (signupLogs) {
        const invalidLogs = signupLogs.filter(log => !isValidUUID(log.transaction_id));
        results.signupLogs.invalid = invalidLogs.length;

        console.log(`Found ${invalidLogs.length} invalid transaction_ids in signup logs`);

        // For now, we'll just log the invalid ones but not modify them
        // to avoid breaking transaction tracking
        for (const log of invalidLogs) {
          console.log(`Invalid transaction_id found: ${log.transaction_id} (record ${log.id})`);
        }

        // Note: We're not fixing these automatically to preserve audit trail
        results.signupLogs.fixed = 0;
      }
    }

    // Clean up upduo_integration_queue if it exists
    if (hasUpdouQueue) {
      console.log('Checking upduo_integration_queue for invalid transaction_ids in metadata...');
      
      const { data: queueItems, error: queueFetchError } = await supabaseClient
        .from('upduo_integration_queue')
        .select('id, metadata')
        .limit(1000); // Process in batches

      if (queueFetchError) {
        console.error('Error fetching queue items:', queueFetchError);
      } else if (queueItems) {
        let invalidQueueItems = 0;
        let fixedQueueItems = 0;

        for (const item of queueItems) {
          if (item.metadata && item.metadata.transaction_id) {
            if (!isValidUUID(item.metadata.transaction_id)) {
              invalidQueueItems++;
              console.log(`Invalid transaction_id in queue metadata: ${item.metadata.transaction_id} (record ${item.id})`);
              
              // Fix this one by generating a new UUID
              const newTransactionId = generateUUID();
              const updatedMetadata = {
                ...item.metadata,
                transaction_id: newTransactionId,
                original_transaction_id: item.metadata.transaction_id,
                fixed_at: new Date().toISOString()
              };

              const { error: updateError } = await supabaseClient
                .from('upduo_integration_queue')
                .update({ metadata: updatedMetadata })
                .eq('id', item.id);

              if (updateError) {
                console.error(`Failed to fix transaction_id for record ${item.id}:`, updateError);
              } else {
                fixedQueueItems++;
                console.log(`Fixed transaction_id for record ${item.id}: ${item.metadata.transaction_id} -> ${newTransactionId}`);
              }
            }
          }
        }

        results.upduoQueue.invalid = invalidQueueItems;
        results.upduoQueue.fixed = fixedQueueItems;
      }
    }

    console.log('Cleanup completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Transaction ID cleanup completed',
        results,
        recommendations: [
          hasSignupLogs && results.signupLogs.invalid > 0 
            ? `Found ${results.signupLogs.invalid} invalid transaction_ids in signup logs. These were logged but not modified to preserve audit trail.`
            : null,
          hasUpdouQueue && results.upduoQueue.invalid > 0
            ? `Fixed ${results.upduoQueue.fixed}/${results.upduoQueue.invalid} invalid transaction_ids in upduo queue.`
            : null,
          'New signups will now use proper UUID format for transaction_ids.'
        ].filter(Boolean)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Cleanup error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});