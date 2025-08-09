
-- This SQL file is for reference. You should run it in the SQL Editor in the Supabase dashboard.
-- It creates a function that will be used to trigger the digest processing on a schedule

-- First enable the required extensions if not already enabled
-- create extension if not exists pg_cron;
-- create extension if not exists pg_net;

-- Function to trigger the digest processing
CREATE OR REPLACE FUNCTION public.trigger_notification_digest()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  request_id text;
  http_response record;
  service_role_key text;
BEGIN
  -- Get the service role key from secrets
  SELECT decrypted_secret INTO service_role_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';

  -- Call the edge function and get request ID
  SELECT net.http_post(
    url := 'https://upffcxqiozqhdgfesmji.supabase.co/functions/v1/process-notification-digests',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object('manualTrigger', false, 'source', 'cron')
  ) INTO request_id;
  
  -- Wait a short time for response to be processed
  PERFORM pg_sleep(0.5);
  
  -- Get response using request_id
  SELECT status, content::json INTO http_response
  FROM net._http_response
  WHERE id = request_id;

  -- If we got a response, return it
  IF http_response.status IS NOT NULL AND http_response.status BETWEEN 200 AND 299 THEN
    RETURN http_response.content;
  ELSE
    -- Return a basic result if no valid response
    RETURN json_build_object('success', false, 'error', 'No valid response received');
  END IF;
END;
$$;

-- Schedule the job to run every 5 minutes
DO $$
BEGIN
  -- Drop existing cron job if it exists
  PERFORM cron.unschedule('process-notification-digests');
  EXCEPTION WHEN OTHERS THEN
    -- Ignore if job doesn't exist
    NULL;
END $$;

-- Create new cron job
SELECT cron.schedule(
  'process-notification-digests',
  '*/5 * * * *',  -- Run every 5 minutes
  $$SELECT public.trigger_notification_digest()$$
);
