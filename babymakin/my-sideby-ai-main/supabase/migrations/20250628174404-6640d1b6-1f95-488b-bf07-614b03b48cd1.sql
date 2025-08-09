
-- Function to send Slack notification for new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user_slack_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  service_role_key text;
  request_id text;
BEGIN
  -- Only send notification for actual new signups (not admin users)
  IF NEW.email NOT LIKE '%@sideby.ai' AND OLD IS NULL THEN
    -- Get the service role key from secrets
    SELECT decrypted_secret INTO service_role_key 
    FROM vault.decrypted_secrets 
    WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';

    -- Call the slack-notification function
    SELECT net.http_post(
      url := 'https://upffcxqiozqhdgfesmji.supabase.co/functions/v1/slack-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'type', 'new_signup',
        'user', jsonb_build_object(
          'id', NEW.id,
          'email', NEW.email,
          'first_name', NEW.first_name,
          'last_name', NEW.last_name
        )
      )
    ) INTO request_id;
    
    -- Log the request for debugging
    INSERT INTO public.notification_delivery_logs (
      notification_id,
      channel,
      success,
      source_table
    ) VALUES (
      gen_random_uuid(),
      'slack',
      true,
      'new_user_signup'
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block the user creation
    INSERT INTO public.notification_delivery_logs (
      notification_id,
      channel,
      success,
      error,
      source_table
    ) VALUES (
      gen_random_uuid(),
      'slack',
      false,
      SQLERRM,
      'new_user_signup'
    );
    
    RETURN NEW;
END;
$$;

-- Create the trigger (drop existing one if it exists)
DROP TRIGGER IF EXISTS on_new_user_slack_notification ON public.profiles;

-- Create trigger for new user Slack notifications
CREATE TRIGGER on_new_user_slack_notification
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_slack_notification();
