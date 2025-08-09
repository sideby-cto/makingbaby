

-- alter table "public"."enhanced_transcript_analysis" enable row level security;

-- alter table "public"."journey_reminder_templates" drop column "email_template_id";

-- alter table "public"."journey_reminder_templates" drop column "template_variables";

-- alter table "public"."user_journey_events" disable row level security;

-- drop type "public"."email_account_type";

-- drop type "public"."template_status";

-- CREATE UNIQUE INDEX enhanced_transcript_analysis_pkey ON public.enhanced_transcript_analysis USING btree (id);

-- CREATE UNIQUE INDEX enhanced_transcript_analysis_transcript_id_analysis_version_key ON public.enhanced_transcript_analysis USING btree (transcript_id, analysis_version);

-- CREATE INDEX idx_enhanced_analysis_created_at ON public.enhanced_transcript_analysis USING btree (created_at);

-- CREATE INDEX idx_enhanced_analysis_emotional ON public.enhanced_transcript_analysis USING gin (emotional_sentiment);

-- CREATE INDEX idx_enhanced_analysis_expertise ON public.enhanced_transcript_analysis USING gin (expertise_indicators);

-- CREATE INDEX idx_enhanced_analysis_semantic_topics ON public.enhanced_transcript_analysis USING gin (semantic_topics);

-- CREATE INDEX idx_enhanced_analysis_transcript_id ON public.enhanced_transcript_analysis USING btree (transcript_id);

-- CREATE INDEX idx_enhanced_analysis_user_id ON public.enhanced_transcript_analysis USING btree (user_id);

-- alter table "public"."enhanced_transcript_analysis" add constraint "enhanced_transcript_analysis_pkey" PRIMARY KEY using index "enhanced_transcript_analysis_pkey";

-- alter table "public"."enhanced_transcript_analysis" add constraint "enhanced_transcript_analysis_transcript_id_analysis_version_key" UNIQUE using index "enhanced_transcript_analysis_transcript_id_analysis_version_key";

-- alter table "public"."enhanced_transcript_analysis" add constraint "fk_transcript_id" FOREIGN KEY (transcript_id) REFERENCES upduo_transcripts(id) ON DELETE CASCADE not valid;

-- alter table "public"."enhanced_transcript_analysis" validate constraint "fk_transcript_id";

-- alter table "public"."enhanced_transcript_analysis" add constraint "fk_user_id" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

-- alter table "public"."enhanced_transcript_analysis" validate constraint "fk_user_id";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_enhanced_analysis_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF TG_TABLE_NAME IN ('email_templates', 'email_accounts', 'profiles', 'matches') THEN
    INSERT INTO public.security_audit_logs (
      user_id, operation, table_name, record_id, old_values, new_values
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.auth_user_is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$ SELECT public.is_admin_user(); $function$
;

CREATE OR REPLACE FUNCTION public.debug_admin_check()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_user_id uuid;
  user_email text;
  is_admin boolean;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', false,
      'user_id', null,
      'email', null,
      'is_admin', false,
      'error', 'No authenticated user'
    );
  END IF;

  SELECT email INTO user_email
  FROM public.profiles
  WHERE id = current_user_id;

  is_admin := user_email LIKE '%@sideby.ai';

  RETURN jsonb_build_object(
    'authenticated', true,
    'user_id', current_user_id,
    'email', user_email,
    'is_admin', is_admin,
    'timestamp', now()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'authenticated', false,
      'error', SQLERRM,
      'timestamp', now()
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_email_template_with_account(template_key_param text)
 RETURNS TABLE(template_id uuid, template_name text, subject text, header_html text, body_html text, footer_html text, variables jsonb, account_type text, from_email text, from_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    et.id,
    et.name,
    et.subject,
    et.header_html,
    et.body_html,
    et.footer_html,
    et.variables,
    et.account_type::text,
    ea.from_email,
    ea.from_name
  FROM email_templates et
  JOIN email_accounts ea ON et.account_type = ea.account_type
  WHERE et.template_key = template_key_param 
    AND et.status = 'active';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  user_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT email INTO user_email
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;

  RETURN user_email LIKE '%@sideby.ai';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$ SELECT public.is_admin_user(); $function$
;

CREATE OR REPLACE FUNCTION public.notify_journey_stage_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Only trigger if journey_stage actually changed
  IF OLD.journey_stage IS DISTINCT FROM NEW.journey_stage THEN
    -- Log the journey event
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
    
    -- Call the journey-monitor edge function asynchronously
    -- This will be handled by a separate process to avoid blocking the profile update
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
$function$
;

-- grant delete on table "public"."enhanced_transcript_analysis" to "anon";

-- grant insert on table "public"."enhanced_transcript_analysis" to "anon";

-- grant references on table "public"."enhanced_transcript_analysis" to "anon";

-- grant select on table "public"."enhanced_transcript_analysis" to "anon";

-- grant trigger on table "public"."enhanced_transcript_analysis" to "anon";

-- grant truncate on table "public"."enhanced_transcript_analysis" to "anon";

-- grant update on table "public"."enhanced_transcript_analysis" to "anon";

-- grant delete on table "public"."enhanced_transcript_analysis" to "authenticated";

-- grant insert on table "public"."enhanced_transcript_analysis" to "authenticated";

-- grant references on table "public"."enhanced_transcript_analysis" to "authenticated";

-- grant select on table "public"."enhanced_transcript_analysis" to "authenticated";

-- grant trigger on table "public"."enhanced_transcript_analysis" to "authenticated";

-- grant truncate on table "public"."enhanced_transcript_analysis" to "authenticated";

-- grant update on table "public"."enhanced_transcript_analysis" to "authenticated";

-- grant delete on table "public"."enhanced_transcript_analysis" to "service_role";

-- grant insert on table "public"."enhanced_transcript_analysis" to "service_role";

-- grant references on table "public"."enhanced_transcript_analysis" to "service_role";

-- grant select on table "public"."enhanced_transcript_analysis" to "service_role";

-- grant trigger on table "public"."enhanced_transcript_analysis" to "service_role";

-- grant truncate on table "public"."enhanced_transcript_analysis" to "service_role";

-- grant update on table "public"."enhanced_transcript_analysis" to "service_role";

-- create policy "Users can view their own enhanced analysis"
-- on "public"."enhanced_transcript_analysis"
-- as permissive
-- for select
-- to public
-- using ((user_id = auth.uid()));


-- CREATE TRIGGER trigger_update_enhanced_analysis_updated_at BEFORE UPDATE ON public.enhanced_transcript_analysis FOR EACH ROW EXECUTE FUNCTION update_enhanced_analysis_updated_at();

-- CREATE TRIGGER audit_profiles AFTER INSERT OR DELETE OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operations();


