
-- Update the notify_journey_stage_change function to create pending notifications
-- using the existing journey reminder templates
CREATE OR REPLACE FUNCTION public.notify_journey_stage_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  template_record RECORD;
  notification_prefs JSONB;
  template_content TEXT;
  template_subject TEXT;
  template_variables TEXT;
  processed_content TEXT;
  processed_subject TEXT;
  user_first_name TEXT;
  user_email TEXT;
BEGIN
  -- Only trigger if journey_stage actually changed
  IF OLD.journey_stage IS DISTINCT FROM NEW.journey_stage THEN
    -- Log the journey event first
    INSERT INTO user_journey_events (user_id, previous_stage, new_stage, metadata)
    VALUES (
      NEW.id, 
      OLD.journey_stage, 
      NEW.journey_stage, 
      jsonb_build_object(
        'trigger_source', 'profile_update',
        'changed_at', NOW()
      )
    );
    
    -- Get user details for template processing
    SELECT first_name, email INTO user_first_name, user_email
    FROM profiles WHERE id = NEW.id;
    
    -- Get user notification preferences
    SELECT notification_preferences INTO notification_prefs 
    FROM profiles WHERE id = NEW.id;
    
    -- Set defaults if preferences are null
    IF notification_prefs IS NULL THEN
      notification_prefs := '{"email": true, "sms": false, "in_app": true}'::jsonb;
    END IF;
    
    -- Look for active journey reminder templates for the new stage
    FOR template_record IN 
      SELECT * FROM journey_reminder_templates 
      WHERE stage = NEW.journey_stage 
      AND active = true
    LOOP
      -- Process template variables if they exist
      template_content := template_record.content;
      template_subject := template_record.subject;
      template_variables := template_record.template_variables;
      
      -- Simple variable replacement for common placeholders
      processed_content := REPLACE(template_content, '{{user_name}}', COALESCE(user_first_name, 'there'));
      processed_content := REPLACE(processed_content, '{{first_name}}', COALESCE(user_first_name, 'there'));
      processed_subject := REPLACE(template_subject, '{{user_name}}', COALESCE(user_first_name, 'there'));
      processed_subject := REPLACE(processed_subject, '{{first_name}}', COALESCE(user_first_name, 'there'));
      
      -- Create email notification if user has email notifications enabled
      IF (notification_prefs->>'email')::boolean = true THEN
        -- Check if template uses centralized email system
        IF template_record.email_template_id IS NOT NULL THEN
          -- Use centralized email template
          INSERT INTO public.pending_notifications (
            user_id,
            notification_type,
            channel,
            title,
            content,
            data
          ) VALUES (
            NEW.id,
            'journey_stage_change',
            'email',
            processed_subject,
            processed_content,
            jsonb_build_object(
              'stage', NEW.journey_stage,
              'previous_stage', OLD.journey_stage,
              'template_id', template_record.id,
              'email_template_id', template_record.email_template_id,
              'is_custom_template', true,
              'template_data', jsonb_build_object(
                'subject', processed_subject,
                'content', processed_content,
                'cta_text', template_record.cta_text,
                'cta_url', template_record.cta_url
              )
            )
          );
        ELSE
          -- Use legacy template format
          INSERT INTO public.pending_notifications (
            user_id,
            notification_type,
            channel,
            title,
            content,
            data
          ) VALUES (
            NEW.id,
            'journey_stage_change',
            'email',
            processed_subject,
            processed_content,
            jsonb_build_object(
              'stage', NEW.journey_stage,
              'previous_stage', OLD.journey_stage,
              'template_id', template_record.id,
              'cta_text', template_record.cta_text,
              'cta_url', template_record.cta_url
            )
          );
        END IF;
        
        -- Log the reminder
        INSERT INTO journey_reminder_logs (
          user_id, 
          stage, 
          reminder_type, 
          template_id,
          success
        ) VALUES (
          NEW.id,
          NEW.journey_stage,
          template_record.reminder_type,
          template_record.id,
          true
        );
      END IF;
      
      -- Create SMS notification if user has SMS notifications enabled and phone is verified
      IF (notification_prefs->>'sms')::boolean = true AND NEW.phone_verified = true THEN
        INSERT INTO public.pending_notifications (
          user_id,
          notification_type,
          channel,
          title,
          content,
          data
        ) VALUES (
          NEW.id,
          'journey_stage_change',
          'sms',
          processed_subject,
          LEFT(processed_content, 100), -- Keep SMS brief
          jsonb_build_object(
            'stage', NEW.journey_stage,
            'previous_stage', OLD.journey_stage,
            'template_id', template_record.id
          )
        );
      END IF;
      
      -- Create in-app notification if user has in-app notifications enabled
      IF (notification_prefs->>'in_app')::boolean = true THEN
        INSERT INTO public.pending_notifications (
          user_id,
          notification_type,
          channel,
          title,
          content,
          data
        ) VALUES (
          NEW.id,
          'journey_stage_change',
          'in_app',
          processed_subject,
          processed_content,
          jsonb_build_object(
            'stage', NEW.journey_stage,
            'previous_stage', OLD.journey_stage,
            'template_id', template_record.id
          )
        );
      END IF;
    END LOOP;
    
    -- Still send the pg_notify for any other systems that might be listening
    PERFORM pg_notify('journey_stage_changed', 
      jsonb_build_object(
        'user_id', NEW.id,
        'previous_stage', OLD.journey_stage,
        'new_stage', NEW.journey_stage,
        'timestamp', NOW()
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Also create a missing table if it doesn't exist for user_journey_events
CREATE TABLE IF NOT EXISTS public.user_journey_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  previous_stage TEXT,
  new_stage TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policy for user_journey_events if table was just created
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_journey_events' 
    AND policyname = 'Admin users can view all journey events'
  ) THEN
    ALTER TABLE public.user_journey_events ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Admin users can view all journey events" 
      ON public.user_journey_events 
      FOR SELECT 
      USING (public.is_admin_user());
      
    CREATE POLICY "System can insert journey events" 
      ON public.user_journey_events 
      FOR INSERT 
      WITH CHECK (true);
  END IF;
END $$;
