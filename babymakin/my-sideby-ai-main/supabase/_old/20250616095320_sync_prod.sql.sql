drop trigger if exists "audit_email_accounts" on "public"."email_accounts";

drop trigger if exists "audit_email_templates" on "public"."email_templates";

drop trigger if exists "audit_profiles" on "public"."profiles";

drop policy "Admin users can manage email accounts" on "public"."email_accounts";

drop policy "Admin users can manage header footer templates" on "public"."email_header_footer_templates";

drop policy "Admin users can manage email logs" on "public"."email_send_logs";

drop policy "Admin users can manage email templates" on "public"."email_templates";

drop policy "Users can create idea comments" on "public"."idea_comments";

drop policy "Users can delete their own idea comments" on "public"."idea_comments";

drop policy "Users can update their own idea comments" on "public"."idea_comments";

drop policy "Users can view idea comments" on "public"."idea_comments";

drop policy "Admins can create messages on any idea" on "public"."idea_discussion_messages";

drop policy "Admins can view all messages" on "public"."idea_discussion_messages";

drop policy "Users can create messages for their own ideas" on "public"."idea_discussion_messages";

drop policy "Users can view messages for their own ideas" on "public"."idea_discussion_messages";

drop policy "Admins can manage match pools" on "public"."match_pools";

drop policy "Admins can create match suggestions" on "public"."match_suggestions";

drop policy "Admins can update match suggestions" on "public"."match_suggestions";

drop policy "Admins can view match suggestions" on "public"."match_suggestions";

drop policy "Admin users can view all journey events" on "public"."user_journey_events";

drop policy "System can insert journey events" on "public"."user_journey_events";

revoke delete on table "public"."email_accounts" from "anon";

revoke insert on table "public"."email_accounts" from "anon";

revoke references on table "public"."email_accounts" from "anon";

revoke select on table "public"."email_accounts" from "anon";

revoke trigger on table "public"."email_accounts" from "anon";

revoke truncate on table "public"."email_accounts" from "anon";

revoke update on table "public"."email_accounts" from "anon";

revoke delete on table "public"."email_accounts" from "authenticated";

revoke insert on table "public"."email_accounts" from "authenticated";

revoke references on table "public"."email_accounts" from "authenticated";

revoke select on table "public"."email_accounts" from "authenticated";

revoke trigger on table "public"."email_accounts" from "authenticated";

revoke truncate on table "public"."email_accounts" from "authenticated";

revoke update on table "public"."email_accounts" from "authenticated";

revoke delete on table "public"."email_accounts" from "service_role";

revoke insert on table "public"."email_accounts" from "service_role";

revoke references on table "public"."email_accounts" from "service_role";

revoke select on table "public"."email_accounts" from "service_role";

revoke trigger on table "public"."email_accounts" from "service_role";

revoke truncate on table "public"."email_accounts" from "service_role";

revoke update on table "public"."email_accounts" from "service_role";

revoke delete on table "public"."email_header_footer_templates" from "anon";

revoke insert on table "public"."email_header_footer_templates" from "anon";

revoke references on table "public"."email_header_footer_templates" from "anon";

revoke select on table "public"."email_header_footer_templates" from "anon";

revoke trigger on table "public"."email_header_footer_templates" from "anon";

revoke truncate on table "public"."email_header_footer_templates" from "anon";

revoke update on table "public"."email_header_footer_templates" from "anon";

revoke delete on table "public"."email_header_footer_templates" from "authenticated";

revoke insert on table "public"."email_header_footer_templates" from "authenticated";

revoke references on table "public"."email_header_footer_templates" from "authenticated";

revoke select on table "public"."email_header_footer_templates" from "authenticated";

revoke trigger on table "public"."email_header_footer_templates" from "authenticated";

revoke truncate on table "public"."email_header_footer_templates" from "authenticated";

revoke update on table "public"."email_header_footer_templates" from "authenticated";

revoke delete on table "public"."email_header_footer_templates" from "service_role";

revoke insert on table "public"."email_header_footer_templates" from "service_role";

revoke references on table "public"."email_header_footer_templates" from "service_role";

revoke select on table "public"."email_header_footer_templates" from "service_role";

revoke trigger on table "public"."email_header_footer_templates" from "service_role";

revoke truncate on table "public"."email_header_footer_templates" from "service_role";

revoke update on table "public"."email_header_footer_templates" from "service_role";

revoke delete on table "public"."email_send_logs" from "anon";

revoke insert on table "public"."email_send_logs" from "anon";

revoke references on table "public"."email_send_logs" from "anon";

revoke select on table "public"."email_send_logs" from "anon";

revoke trigger on table "public"."email_send_logs" from "anon";

revoke truncate on table "public"."email_send_logs" from "anon";

revoke update on table "public"."email_send_logs" from "anon";

revoke delete on table "public"."email_send_logs" from "authenticated";

revoke insert on table "public"."email_send_logs" from "authenticated";

revoke references on table "public"."email_send_logs" from "authenticated";

revoke select on table "public"."email_send_logs" from "authenticated";

revoke trigger on table "public"."email_send_logs" from "authenticated";

revoke truncate on table "public"."email_send_logs" from "authenticated";

revoke update on table "public"."email_send_logs" from "authenticated";

revoke delete on table "public"."email_send_logs" from "service_role";

revoke insert on table "public"."email_send_logs" from "service_role";

revoke references on table "public"."email_send_logs" from "service_role";

revoke select on table "public"."email_send_logs" from "service_role";

revoke trigger on table "public"."email_send_logs" from "service_role";

revoke truncate on table "public"."email_send_logs" from "service_role";

revoke update on table "public"."email_send_logs" from "service_role";

revoke delete on table "public"."email_templates" from "anon";

revoke insert on table "public"."email_templates" from "anon";

revoke references on table "public"."email_templates" from "anon";

revoke select on table "public"."email_templates" from "anon";

revoke trigger on table "public"."email_templates" from "anon";

revoke truncate on table "public"."email_templates" from "anon";

revoke update on table "public"."email_templates" from "anon";

revoke delete on table "public"."email_templates" from "authenticated";

revoke insert on table "public"."email_templates" from "authenticated";

revoke references on table "public"."email_templates" from "authenticated";

revoke select on table "public"."email_templates" from "authenticated";

revoke trigger on table "public"."email_templates" from "authenticated";

revoke truncate on table "public"."email_templates" from "authenticated";

revoke update on table "public"."email_templates" from "authenticated";

revoke delete on table "public"."email_templates" from "service_role";

revoke insert on table "public"."email_templates" from "service_role";

revoke references on table "public"."email_templates" from "service_role";

revoke select on table "public"."email_templates" from "service_role";

revoke trigger on table "public"."email_templates" from "service_role";

revoke truncate on table "public"."email_templates" from "service_role";

revoke update on table "public"."email_templates" from "service_role";

revoke delete on table "public"."idea_comments" from "anon";

revoke insert on table "public"."idea_comments" from "anon";

revoke references on table "public"."idea_comments" from "anon";

revoke select on table "public"."idea_comments" from "anon";

revoke trigger on table "public"."idea_comments" from "anon";

revoke truncate on table "public"."idea_comments" from "anon";

revoke update on table "public"."idea_comments" from "anon";

revoke delete on table "public"."idea_comments" from "authenticated";

revoke insert on table "public"."idea_comments" from "authenticated";

revoke references on table "public"."idea_comments" from "authenticated";

revoke select on table "public"."idea_comments" from "authenticated";

revoke trigger on table "public"."idea_comments" from "authenticated";

revoke truncate on table "public"."idea_comments" from "authenticated";

revoke update on table "public"."idea_comments" from "authenticated";

revoke delete on table "public"."idea_comments" from "service_role";

revoke insert on table "public"."idea_comments" from "service_role";

revoke references on table "public"."idea_comments" from "service_role";

revoke select on table "public"."idea_comments" from "service_role";

revoke trigger on table "public"."idea_comments" from "service_role";

revoke truncate on table "public"."idea_comments" from "service_role";

revoke update on table "public"."idea_comments" from "service_role";

revoke delete on table "public"."idea_discussion_messages" from "anon";

revoke insert on table "public"."idea_discussion_messages" from "anon";

revoke references on table "public"."idea_discussion_messages" from "anon";

revoke select on table "public"."idea_discussion_messages" from "anon";

revoke trigger on table "public"."idea_discussion_messages" from "anon";

revoke truncate on table "public"."idea_discussion_messages" from "anon";

revoke update on table "public"."idea_discussion_messages" from "anon";

revoke delete on table "public"."idea_discussion_messages" from "authenticated";

revoke insert on table "public"."idea_discussion_messages" from "authenticated";

revoke references on table "public"."idea_discussion_messages" from "authenticated";

revoke select on table "public"."idea_discussion_messages" from "authenticated";

revoke trigger on table "public"."idea_discussion_messages" from "authenticated";

revoke truncate on table "public"."idea_discussion_messages" from "authenticated";

revoke update on table "public"."idea_discussion_messages" from "authenticated";

revoke delete on table "public"."idea_discussion_messages" from "service_role";

revoke insert on table "public"."idea_discussion_messages" from "service_role";

revoke references on table "public"."idea_discussion_messages" from "service_role";

revoke select on table "public"."idea_discussion_messages" from "service_role";

revoke trigger on table "public"."idea_discussion_messages" from "service_role";

revoke truncate on table "public"."idea_discussion_messages" from "service_role";

revoke update on table "public"."idea_discussion_messages" from "service_role";

revoke delete on table "public"."match_pools" from "anon";

revoke insert on table "public"."match_pools" from "anon";

revoke references on table "public"."match_pools" from "anon";

revoke select on table "public"."match_pools" from "anon";

revoke trigger on table "public"."match_pools" from "anon";

revoke truncate on table "public"."match_pools" from "anon";

revoke update on table "public"."match_pools" from "anon";

revoke delete on table "public"."match_pools" from "authenticated";

revoke insert on table "public"."match_pools" from "authenticated";

revoke references on table "public"."match_pools" from "authenticated";

revoke select on table "public"."match_pools" from "authenticated";

revoke trigger on table "public"."match_pools" from "authenticated";

revoke truncate on table "public"."match_pools" from "authenticated";

revoke update on table "public"."match_pools" from "authenticated";

revoke delete on table "public"."match_pools" from "service_role";

revoke insert on table "public"."match_pools" from "service_role";

revoke references on table "public"."match_pools" from "service_role";

revoke select on table "public"."match_pools" from "service_role";

revoke trigger on table "public"."match_pools" from "service_role";

revoke truncate on table "public"."match_pools" from "service_role";

revoke update on table "public"."match_pools" from "service_role";

revoke delete on table "public"."match_suggestions" from "anon";

revoke insert on table "public"."match_suggestions" from "anon";

revoke references on table "public"."match_suggestions" from "anon";

revoke select on table "public"."match_suggestions" from "anon";

revoke trigger on table "public"."match_suggestions" from "anon";

revoke truncate on table "public"."match_suggestions" from "anon";

revoke update on table "public"."match_suggestions" from "anon";

revoke delete on table "public"."match_suggestions" from "authenticated";

revoke insert on table "public"."match_suggestions" from "authenticated";

revoke references on table "public"."match_suggestions" from "authenticated";

revoke select on table "public"."match_suggestions" from "authenticated";

revoke trigger on table "public"."match_suggestions" from "authenticated";

revoke truncate on table "public"."match_suggestions" from "authenticated";

revoke update on table "public"."match_suggestions" from "authenticated";

revoke delete on table "public"."match_suggestions" from "service_role";

revoke insert on table "public"."match_suggestions" from "service_role";

revoke references on table "public"."match_suggestions" from "service_role";

revoke select on table "public"."match_suggestions" from "service_role";

revoke trigger on table "public"."match_suggestions" from "service_role";

revoke truncate on table "public"."match_suggestions" from "service_role";

revoke update on table "public"."match_suggestions" from "service_role";

alter table "public"."email_accounts" drop constraint "email_accounts_account_type_key";

alter table "public"."email_header_footer_templates" drop constraint "email_header_footer_templates_type_check";

alter table "public"."email_send_logs" drop constraint "email_send_logs_template_id_fkey";

alter table "public"."email_templates" drop constraint "email_templates_created_by_fkey";

alter table "public"."email_templates" drop constraint "email_templates_footer_template_id_fkey";

alter table "public"."email_templates" drop constraint "email_templates_header_template_id_fkey";

alter table "public"."email_templates" drop constraint "email_templates_template_key_key";

alter table "public"."idea_comments" drop constraint "idea_comments_idea_id_fkey";

alter table "public"."idea_discussion_messages" drop constraint "fk_idea_discussion_messages_sender";

alter table "public"."idea_discussion_messages" drop constraint "idea_discussion_messages_idea_id_fkey";

alter table "public"."idea_discussion_messages" drop constraint "idea_discussion_messages_sender_type_check";

alter table "public"."journey_reminder_templates" drop constraint "journey_reminder_templates_email_template_id_fkey";

alter table "public"."match_pools" drop constraint "match_pools_status_check";

alter table "public"."match_suggestions" drop constraint "match_suggestions_pool_id_fkey";

alter table "public"."match_suggestions" drop constraint "match_suggestions_status_check";

drop function if exists "public"."get_user_transcripts_for_matching"(user_emails_param text[]);

drop function if exists "public"."get_email_template_with_account"(template_key_param text);

alter table "public"."email_accounts" drop constraint "email_accounts_pkey";

alter table "public"."email_header_footer_templates" drop constraint "email_header_footer_templates_pkey";

alter table "public"."email_send_logs" drop constraint "email_send_logs_pkey";

alter table "public"."email_templates" drop constraint "email_templates_pkey";

alter table "public"."idea_comments" drop constraint "idea_comments_pkey";

alter table "public"."idea_discussion_messages" drop constraint "idea_discussion_messages_pkey";

alter table "public"."match_pools" drop constraint "match_pools_pkey";

alter table "public"."match_suggestions" drop constraint "match_suggestions_pkey";

drop index if exists "public"."email_accounts_account_type_key";

drop index if exists "public"."email_accounts_pkey";

drop index if exists "public"."email_header_footer_templates_pkey";

drop index if exists "public"."email_send_logs_pkey";

drop index if exists "public"."email_templates_pkey";

drop index if exists "public"."email_templates_template_key_key";

drop index if exists "public"."idea_comments_pkey";

drop index if exists "public"."idea_discussion_messages_pkey";

drop index if exists "public"."idx_email_header_footer_templates_account_type";

drop index if exists "public"."idx_email_header_footer_templates_is_default";

drop index if exists "public"."idx_email_header_footer_templates_type";

drop index if exists "public"."idx_email_templates_footer_template_id";

drop index if exists "public"."idx_email_templates_header_template_id";

drop index if exists "public"."idx_idea_comments_created_at";

drop index if exists "public"."idx_idea_comments_idea_id";

drop index if exists "public"."idx_idea_comments_user_id";

drop index if exists "public"."idx_idea_discussion_messages_created_at";

drop index if exists "public"."idx_idea_discussion_messages_idea_id";

drop index if exists "public"."idx_match_pools_created_by";

drop index if exists "public"."idx_match_pools_status";

drop index if exists "public"."idx_match_suggestions_pool_id";

drop index if exists "public"."idx_match_suggestions_status";

drop index if exists "public"."idx_match_suggestions_user_emails";

drop index if exists "public"."match_pools_pkey";

drop index if exists "public"."match_suggestions_pkey";

drop table "public"."email_accounts";

drop table "public"."email_header_footer_templates";

drop table "public"."email_send_logs";

drop table "public"."email_templates";

drop table "public"."idea_comments";

drop table "public"."idea_discussion_messages";

drop table "public"."match_pools";

drop table "public"."match_suggestions";

create table "public"."enhanced_transcript_analysis" (
    "id" uuid not null default gen_random_uuid(),
    "transcript_id" uuid,
    "user_id" uuid,
    "emotional_sentiment" jsonb not null,
    "engagement_patterns" jsonb not null,
    "semantic_topics" jsonb not null,
    "expertise_indicators" jsonb not null,
    "learning_moments" jsonb not null,
    "personality_traits" jsonb not null,
    "analysis_version" text not null default '1.0'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."enhanced_transcript_analysis" enable row level security;

alter table "public"."journey_reminder_templates" drop column "email_template_id";

alter table "public"."journey_reminder_templates" drop column "template_variables";

alter table "public"."user_journey_events" disable row level security;

drop type "public"."email_account_type";

drop type "public"."template_status";

CREATE UNIQUE INDEX enhanced_transcript_analysis_pkey ON public.enhanced_transcript_analysis USING btree (id);

CREATE UNIQUE INDEX enhanced_transcript_analysis_transcript_id_analysis_version_key ON public.enhanced_transcript_analysis USING btree (transcript_id, analysis_version);

CREATE INDEX idx_enhanced_analysis_created_at ON public.enhanced_transcript_analysis USING btree (created_at);

CREATE INDEX idx_enhanced_analysis_emotional ON public.enhanced_transcript_analysis USING gin (emotional_sentiment);

CREATE INDEX idx_enhanced_analysis_expertise ON public.enhanced_transcript_analysis USING gin (expertise_indicators);

CREATE INDEX idx_enhanced_analysis_semantic_topics ON public.enhanced_transcript_analysis USING gin (semantic_topics);

CREATE INDEX idx_enhanced_analysis_transcript_id ON public.enhanced_transcript_analysis USING btree (transcript_id);

CREATE INDEX idx_enhanced_analysis_user_id ON public.enhanced_transcript_analysis USING btree (user_id);

alter table "public"."enhanced_transcript_analysis" add constraint "enhanced_transcript_analysis_pkey" PRIMARY KEY using index "enhanced_transcript_analysis_pkey";

alter table "public"."enhanced_transcript_analysis" add constraint "enhanced_transcript_analysis_transcript_id_analysis_version_key" UNIQUE using index "enhanced_transcript_analysis_transcript_id_analysis_version_key";

alter table "public"."enhanced_transcript_analysis" add constraint "fk_transcript_id" FOREIGN KEY (transcript_id) REFERENCES upduo_transcripts(id) ON DELETE CASCADE not valid;

alter table "public"."enhanced_transcript_analysis" validate constraint "fk_transcript_id";

alter table "public"."enhanced_transcript_analysis" add constraint "fk_user_id" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."enhanced_transcript_analysis" validate constraint "fk_user_id";

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

grant delete on table "public"."enhanced_transcript_analysis" to "anon";

grant insert on table "public"."enhanced_transcript_analysis" to "anon";

grant references on table "public"."enhanced_transcript_analysis" to "anon";

grant select on table "public"."enhanced_transcript_analysis" to "anon";

grant trigger on table "public"."enhanced_transcript_analysis" to "anon";

grant truncate on table "public"."enhanced_transcript_analysis" to "anon";

grant update on table "public"."enhanced_transcript_analysis" to "anon";

grant delete on table "public"."enhanced_transcript_analysis" to "authenticated";

grant insert on table "public"."enhanced_transcript_analysis" to "authenticated";

grant references on table "public"."enhanced_transcript_analysis" to "authenticated";

grant select on table "public"."enhanced_transcript_analysis" to "authenticated";

grant trigger on table "public"."enhanced_transcript_analysis" to "authenticated";

grant truncate on table "public"."enhanced_transcript_analysis" to "authenticated";

grant update on table "public"."enhanced_transcript_analysis" to "authenticated";

grant delete on table "public"."enhanced_transcript_analysis" to "service_role";

grant insert on table "public"."enhanced_transcript_analysis" to "service_role";

grant references on table "public"."enhanced_transcript_analysis" to "service_role";

grant select on table "public"."enhanced_transcript_analysis" to "service_role";

grant trigger on table "public"."enhanced_transcript_analysis" to "service_role";

grant truncate on table "public"."enhanced_transcript_analysis" to "service_role";

grant update on table "public"."enhanced_transcript_analysis" to "service_role";

create policy "Users can view their own enhanced analysis"
on "public"."enhanced_transcript_analysis"
as permissive
for select
to public
using ((user_id = auth.uid()));


CREATE TRIGGER trigger_update_enhanced_analysis_updated_at BEFORE UPDATE ON public.enhanced_transcript_analysis FOR EACH ROW EXECUTE FUNCTION update_enhanced_analysis_updated_at();

CREATE TRIGGER audit_profiles AFTER INSERT OR DELETE OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operations();


