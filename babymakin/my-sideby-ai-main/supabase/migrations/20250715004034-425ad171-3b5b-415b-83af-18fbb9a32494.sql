-- Create a logging table for Upduo integration attempts
CREATE TABLE IF NOT EXISTS public.upduo_integration_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  crew_code TEXT,
  attempt_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for the logs table
ALTER TABLE public.upduo_integration_logs ENABLE ROW LEVEL SECURITY;

-- Admin users can view all logs
CREATE POLICY "Admin users can view all Upduo logs" ON public.upduo_integration_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email LIKE '%@sideby.ai'
    )
  );

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_upduo_logs_user_success ON public.upduo_integration_logs(user_id, success);
CREATE INDEX IF NOT EXISTS idx_upduo_logs_timestamp ON public.upduo_integration_logs(attempt_timestamp);

-- Create a function to call the Upduo integration edge function
CREATE OR REPLACE FUNCTION public.trigger_upduo_integration()
RETURNS TRIGGER AS $$
DECLARE
  service_role_key TEXT;
  function_url TEXT;
BEGIN
  -- Only trigger for new profiles with email
  IF TG_OP = 'INSERT' AND NEW.email IS NOT NULL THEN
    -- Get the service role key from vault
    SELECT decrypted_secret INTO service_role_key 
    FROM vault.decrypted_secrets 
    WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';
    
    -- Construct the function URL
    function_url := 'https://upffcxqiozqhdgfesmji.supabase.co/functions/v1/add-user-to-upduo-roster';
    
    -- Call the edge function asynchronously
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'record', jsonb_build_object(
          'id', NEW.id,
          'email', NEW.email,
          'first_name', NEW.first_name,
          'last_name', NEW.last_name,
          'crew_code', NEW.metadata->>'crew_code'
        )
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on profiles table
DROP TRIGGER IF EXISTS trigger_upduo_integration_on_profile_insert ON public.profiles;
CREATE TRIGGER trigger_upduo_integration_on_profile_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_upduo_integration();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres;
GRANT EXECUTE ON FUNCTION net.http_post TO postgres;