-- Fix the database trigger to log "pending" instead of "success" 
-- and improve the Upduo integration status tracking

CREATE OR REPLACE FUNCTION public.trigger_upduo_integration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  service_role_key TEXT;
  function_url TEXT;
  response_result TEXT;
BEGIN
  -- Only trigger for new profiles with email
  IF TG_OP = 'INSERT' AND NEW.email IS NOT NULL THEN
    -- Update profile to show pending status if not already set
    NEW.upduo_status := COALESCE(NEW.upduo_status, 'pending');
    
    -- Get the service role key from vault
    SELECT decrypted_secret INTO service_role_key 
    FROM vault.decrypted_secrets 
    WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';
    
    -- Only proceed if we have the service role key
    IF service_role_key IS NOT NULL THEN
      -- Construct the function URL
      function_url := 'https://upffcxqiozqhdgfesmji.supabase.co/functions/v1/add-user-to-upduo-roster';
      
      BEGIN
        -- Call the edge function asynchronously with error handling
        SELECT net.http_post(
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
        ) INTO response_result;
        
        -- Log PENDING status (the edge function will update this to success/failed)
        INSERT INTO public.upduo_integration_logs (
          user_id, email, success, error_message, crew_code
        ) VALUES (
          NEW.id, NEW.email, false, 'Integration triggered - pending API call', NEW.metadata->>'crew_code'
        );
        
      EXCEPTION WHEN OTHERS THEN
        -- Log failed trigger execution but don't block profile creation
        INSERT INTO public.upduo_integration_logs (
          user_id, email, success, error_message, crew_code
        ) VALUES (
          NEW.id, NEW.email, false, 'Trigger failed: ' || SQLERRM, NEW.metadata->>'crew_code'
        );
        
        -- Mark status as failed in profile
        NEW.upduo_status := 'failed';
        NEW.upduo_error := 'Trigger failed: ' || SQLERRM;
      END;
    ELSE
      -- Log missing service role key
      INSERT INTO public.upduo_integration_logs (
        user_id, email, success, error_message, crew_code
      ) VALUES (
        NEW.id, NEW.email, false, 'Service role key not found', NEW.metadata->>'crew_code'
      );
      
      -- Mark status as failed in profile
      NEW.upduo_status := 'failed';
      NEW.upduo_error := 'Service role key not found';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;