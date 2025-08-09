-- Fix the trigger function to include proper search_path for security
CREATE OR REPLACE FUNCTION public.trigger_idea_notification()
RETURNS TRIGGER AS $$
DECLARE
  service_role_key TEXT;
  creator_name TEXT;
BEGIN
  -- Only trigger for new ideas
  IF TG_OP = 'INSERT' AND NEW.type = 'idea' THEN
    -- Get creator's name
    SELECT COALESCE(first_name || ' ' || last_name, 'Someone')
    INTO creator_name
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Get service role key for calling edge function
    SELECT decrypted_secret INTO service_role_key 
    FROM vault.decrypted_secrets 
    WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';
    
    -- Call the edge function asynchronously (don't block on failure)
    BEGIN
      PERFORM net.http_post(
        url := 'https://upffcxqiozqhdgfesmji.supabase.co/functions/v1/generate-idea-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'ideaId', NEW.id,
          'userId', NEW.user_id,
          'content', NEW.content,
          'creatorName', creator_name
        )
      );
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the insert
      RAISE WARNING 'Failed to trigger idea notification: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;