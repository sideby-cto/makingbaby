-- alter extension "pg_graphql" update to '1.5.11';

-- alter extension "supabase_vault" update to '0.3.1';

create type "public"."email_account_type" as enum ('robot', 'team', 'info', 'notifications');

create type "public"."template_status" as enum ('active', 'draft', 'archived');

drop trigger if exists "on_auth_user_created" on "auth"."users";

drop trigger if exists "on_auth_user_created_check_admin" on "auth"."users";

drop trigger if exists "on_auth_user_email_updated" on "auth"."users";

drop trigger if exists "trigger_update_enhanced_analysis_updated_at" on "public"."enhanced_transcript_analysis";

-- drop trigger if exists "secrets_encrypt_secret_trigger_secret" on "vault"."secrets";

drop trigger if exists "audit_profiles" on "public"."profiles";

drop policy "Allow admins to view users" on "auth"."users";

drop policy "Users can view their own enhanced analysis" on "public"."enhanced_transcript_analysis";

drop policy "Admin can access all transcript files" on "storage"."objects";

drop policy "Allow authenticated users to upload avatars" on "storage"."objects";

drop policy "Allow public viewing of avatars" on "storage"."objects";

drop policy "Allow users to delete their own avatars" on "storage"."objects";

drop policy "Allow users to update their own avatars" on "storage"."objects";

drop policy "Anyone can view avatars" on "storage"."objects";

drop policy "Authenticated Users Can Upload Videos" on "storage"."objects";

drop policy "Authenticated users can upload avatars" on "storage"."objects";

drop policy "Authenticated users can upload" on "storage"."objects";

drop policy "Avatar images are publicly accessible" on "storage"."objects";

drop policy "Public Access for Videos" on "storage"."objects";

drop policy "Users can update their own avatar" on "storage"."objects";

drop policy "Users can upload their own avatar" on "storage"."objects";

drop policy "Public Access" on "storage"."objects";

drop policy "Users can delete their own avatars" on "storage"."objects";

drop policy "Users can update their own avatars" on "storage"."objects";

alter table "public"."enhanced_transcript_analysis" drop constraint "enhanced_transcript_analysis_transcript_id_analysis_version_key";

alter table "public"."enhanced_transcript_analysis" drop constraint "fk_transcript_id";

alter table "public"."enhanced_transcript_analysis" drop constraint "fk_user_id";

drop function if exists "public"."update_enhanced_analysis_updated_at"();

-- drop view if exists "vault"."decrypted_secrets";

-- drop function if exists "vault"."secrets_encrypt_secret_secret"();

drop function if exists "public"."get_email_template_with_account"(template_key_param text);

alter table "public"."enhanced_transcript_analysis" drop constraint "enhanced_transcript_analysis_pkey";

drop index if exists "public"."enhanced_transcript_analysis_pkey";

drop index if exists "public"."enhanced_transcript_analysis_transcript_id_analysis_version_key";

drop index if exists "public"."idx_enhanced_analysis_created_at";

drop index if exists "public"."idx_enhanced_analysis_emotional";

drop index if exists "public"."idx_enhanced_analysis_expertise";

drop index if exists "public"."idx_enhanced_analysis_semantic_topics";

drop index if exists "public"."idx_enhanced_analysis_transcript_id";

drop index if exists "public"."idx_enhanced_analysis_user_id";

drop table "public"."enhanced_transcript_analysis";

create table "public"."email_accounts" (
    "id" uuid not null default gen_random_uuid(),
    "account_type" email_account_type not null,
    "from_email" text not null,
    "from_name" text not null,
    "is_default" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."email_header_footer_templates" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "type" text not null,
    "html_content" text not null,
    "account_type" email_account_type not null default 'robot'::email_account_type,
    "is_default" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."email_send_logs" (
    "id" uuid not null default gen_random_uuid(),
    "template_id" uuid,
    "recipient_email" text not null,
    "subject" text not null,
    "rendered_html" text,
    "variables_used" jsonb,
    "account_type" email_account_type,
    "status" text default 'pending'::text,
    "error_message" text,
    "sent_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
);


create table "public"."email_templates" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "subject" text not null,
    "template_key" text not null,
    "description" text,
    "header_html" text,
    "body_html" text not null,
    "footer_html" text,
    "variables" jsonb default '[]'::jsonb,
    "account_type" email_account_type default 'robot'::email_account_type,
    "status" template_status default 'draft'::template_status,
    "created_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "header_template_id" uuid,
    "footer_template_id" uuid
);


create table "public"."idea_comments" (
    "id" uuid not null default gen_random_uuid(),
    "idea_id" uuid not null,
    "user_id" uuid not null,
    "content" text not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."idea_comments" enable row level security;

create table "public"."idea_discussion_messages" (
    "id" uuid not null default gen_random_uuid(),
    "idea_id" uuid not null,
    "sender_id" uuid not null,
    "content" text not null,
    "sender_type" text not null default 'user'::text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."idea_discussion_messages" enable row level security;

create table "public"."match_pools" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "user_emails" text[] not null default '{}'::text[],
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "status" text not null default 'active'::text
);


alter table "public"."match_pools" enable row level security;

create table "public"."match_suggestions" (
    "id" uuid not null default gen_random_uuid(),
    "pool_id" uuid not null,
    "user1_email" text not null,
    "user2_email" text not null,
    "user1_id" uuid,
    "user2_id" uuid,
    "match_reason" text not null,
    "confidence_score" double precision default 0.8,
    "transcript_analysis" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "status" text not null default 'pending'::text
);


alter table "public"."match_suggestions" enable row level security;

alter table "public"."journey_reminder_templates" add column "email_template_id" uuid;

alter table "public"."journey_reminder_templates" add column "template_variables" text;

alter table "public"."user_journey_events" enable row level security;

alter table "supabase_migrations"."schema_migrations" add column "idempotency_key" text;

CREATE UNIQUE INDEX email_accounts_account_type_key ON public.email_accounts USING btree (account_type);

CREATE UNIQUE INDEX email_accounts_pkey ON public.email_accounts USING btree (id);

CREATE UNIQUE INDEX email_header_footer_templates_pkey ON public.email_header_footer_templates USING btree (id);

CREATE UNIQUE INDEX email_send_logs_pkey ON public.email_send_logs USING btree (id);

CREATE UNIQUE INDEX email_templates_pkey ON public.email_templates USING btree (id);

CREATE UNIQUE INDEX email_templates_template_key_key ON public.email_templates USING btree (template_key);

CREATE UNIQUE INDEX idea_comments_pkey ON public.idea_comments USING btree (id);

CREATE UNIQUE INDEX idea_discussion_messages_pkey ON public.idea_discussion_messages USING btree (id);

CREATE INDEX idx_email_header_footer_templates_account_type ON public.email_header_footer_templates USING btree (account_type);

CREATE INDEX idx_email_header_footer_templates_is_default ON public.email_header_footer_templates USING btree (is_default);

CREATE INDEX idx_email_header_footer_templates_type ON public.email_header_footer_templates USING btree (type);

CREATE INDEX idx_email_templates_footer_template_id ON public.email_templates USING btree (footer_template_id);

CREATE INDEX idx_email_templates_header_template_id ON public.email_templates USING btree (header_template_id);

CREATE INDEX idx_idea_comments_created_at ON public.idea_comments USING btree (created_at);

CREATE INDEX idx_idea_comments_idea_id ON public.idea_comments USING btree (idea_id);

CREATE INDEX idx_idea_comments_user_id ON public.idea_comments USING btree (user_id);

CREATE INDEX idx_idea_discussion_messages_created_at ON public.idea_discussion_messages USING btree (created_at);

CREATE INDEX idx_idea_discussion_messages_idea_id ON public.idea_discussion_messages USING btree (idea_id);

CREATE INDEX idx_match_pools_created_by ON public.match_pools USING btree (created_by);

CREATE INDEX idx_match_pools_status ON public.match_pools USING btree (status);

CREATE INDEX idx_match_suggestions_pool_id ON public.match_suggestions USING btree (pool_id);

CREATE INDEX idx_match_suggestions_status ON public.match_suggestions USING btree (status);

CREATE INDEX idx_match_suggestions_user_emails ON public.match_suggestions USING btree (user1_email, user2_email);

CREATE UNIQUE INDEX match_pools_pkey ON public.match_pools USING btree (id);

CREATE UNIQUE INDEX match_suggestions_pkey ON public.match_suggestions USING btree (id);

CREATE UNIQUE INDEX schema_migrations_idempotency_key_key ON supabase_migrations.schema_migrations USING btree (idempotency_key);

alter table "public"."email_accounts" add constraint "email_accounts_pkey" PRIMARY KEY using index "email_accounts_pkey";

alter table "public"."email_header_footer_templates" add constraint "email_header_footer_templates_pkey" PRIMARY KEY using index "email_header_footer_templates_pkey";

alter table "public"."email_send_logs" add constraint "email_send_logs_pkey" PRIMARY KEY using index "email_send_logs_pkey";

alter table "public"."email_templates" add constraint "email_templates_pkey" PRIMARY KEY using index "email_templates_pkey";

alter table "public"."idea_comments" add constraint "idea_comments_pkey" PRIMARY KEY using index "idea_comments_pkey";

alter table "public"."idea_discussion_messages" add constraint "idea_discussion_messages_pkey" PRIMARY KEY using index "idea_discussion_messages_pkey";

alter table "public"."match_pools" add constraint "match_pools_pkey" PRIMARY KEY using index "match_pools_pkey";

alter table "public"."match_suggestions" add constraint "match_suggestions_pkey" PRIMARY KEY using index "match_suggestions_pkey";

alter table "public"."email_accounts" add constraint "email_accounts_account_type_key" UNIQUE using index "email_accounts_account_type_key";

alter table "public"."email_header_footer_templates" add constraint "email_header_footer_templates_type_check" CHECK ((type = ANY (ARRAY['header'::text, 'footer'::text]))) not valid;

alter table "public"."email_header_footer_templates" validate constraint "email_header_footer_templates_type_check";

alter table "public"."email_send_logs" add constraint "email_send_logs_template_id_fkey" FOREIGN KEY (template_id) REFERENCES email_templates(id) not valid;

alter table "public"."email_send_logs" validate constraint "email_send_logs_template_id_fkey";

alter table "public"."email_templates" add constraint "email_templates_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."email_templates" validate constraint "email_templates_created_by_fkey";

alter table "public"."email_templates" add constraint "email_templates_footer_template_id_fkey" FOREIGN KEY (footer_template_id) REFERENCES email_header_footer_templates(id) not valid;

alter table "public"."email_templates" validate constraint "email_templates_footer_template_id_fkey";

alter table "public"."email_templates" add constraint "email_templates_header_template_id_fkey" FOREIGN KEY (header_template_id) REFERENCES email_header_footer_templates(id) not valid;

alter table "public"."email_templates" validate constraint "email_templates_header_template_id_fkey";

alter table "public"."email_templates" add constraint "email_templates_template_key_key" UNIQUE using index "email_templates_template_key_key";

alter table "public"."idea_comments" add constraint "idea_comments_idea_id_fkey" FOREIGN KEY (idea_id) REFERENCES saved_items(id) ON DELETE CASCADE not valid;

alter table "public"."idea_comments" validate constraint "idea_comments_idea_id_fkey";

alter table "public"."idea_discussion_messages" add constraint "fk_idea_discussion_messages_sender" FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."idea_discussion_messages" validate constraint "fk_idea_discussion_messages_sender";

alter table "public"."idea_discussion_messages" add constraint "idea_discussion_messages_idea_id_fkey" FOREIGN KEY (idea_id) REFERENCES saved_items(id) ON DELETE CASCADE not valid;

alter table "public"."idea_discussion_messages" validate constraint "idea_discussion_messages_idea_id_fkey";

alter table "public"."idea_discussion_messages" add constraint "idea_discussion_messages_sender_type_check" CHECK ((sender_type = ANY (ARRAY['user'::text, 'admin'::text]))) not valid;

alter table "public"."idea_discussion_messages" validate constraint "idea_discussion_messages_sender_type_check";

alter table "public"."journey_reminder_templates" add constraint "journey_reminder_templates_email_template_id_fkey" FOREIGN KEY (email_template_id) REFERENCES email_templates(id) not valid;

alter table "public"."journey_reminder_templates" validate constraint "journey_reminder_templates_email_template_id_fkey";

alter table "public"."match_pools" add constraint "match_pools_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'archived'::text, 'processing'::text]))) not valid;

alter table "public"."match_pools" validate constraint "match_pools_status_check";

alter table "public"."match_suggestions" add constraint "match_suggestions_pool_id_fkey" FOREIGN KEY (pool_id) REFERENCES match_pools(id) ON DELETE CASCADE not valid;

alter table "public"."match_suggestions" validate constraint "match_suggestions_pool_id_fkey";

alter table "public"."match_suggestions" add constraint "match_suggestions_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'matched'::text]))) not valid;

alter table "public"."match_suggestions" validate constraint "match_suggestions_status_check";

alter table "supabase_migrations"."schema_migrations" add constraint "schema_migrations_idempotency_key_key" UNIQUE using index "schema_migrations_idempotency_key_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_transcripts_for_matching(user_emails_param text[])
 RETURNS TABLE(user_email text, user_id uuid, transcript_data jsonb, session_metadata jsonb, quality_score integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.email,
    p.id,
    ut.transcript,
    ut.metadata,
    ut.quality_score,
    ut.created_at
  FROM public.profiles p
  JOIN public.upduo_transcripts ut ON p.id = ut.user_id
  WHERE p.email = ANY(user_emails_param)
    AND ut.quality_score >= 50  -- Only include decent quality transcripts
  ORDER BY p.email, ut.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION auth.email()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$function$
;

CREATE OR REPLACE FUNCTION auth.jwt()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$function$
;

CREATE OR REPLACE FUNCTION auth.role()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$function$
;

CREATE OR REPLACE FUNCTION auth.uid()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$function$
;

CREATE OR REPLACE FUNCTION extensions.grant_pg_cron_access()
 RETURNS event_trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION extensions.grant_pg_net_access()
 RETURNS event_trigger
 LANGUAGE plpgsql
AS $function$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM pg_event_trigger_ddl_commands() AS ev
      JOIN pg_extension AS ext
      ON ev.objid = ext.oid
      WHERE ext.extname = 'pg_net'
    )
    THEN
      GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

      IF EXISTS (
        SELECT FROM pg_extension
        WHERE extname = 'pg_net'
        -- all versions in use on existing projects as of 2025-02-20
        -- version 0.12.0 onwards don't need these applied
        AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
      ) THEN
        ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
        ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

        ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
        ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

        REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
        REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

        GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
        GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      END IF;
    END IF;
  END;
  $function$
;

CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Log operations on sensitive tables
  IF TG_TABLE_NAME IN ('email_templates', 'email_accounts', 'profiles', 'matches') THEN
    INSERT INTO public.security_audit_logs (
      user_id,
      operation,
      table_name,
      record_id,
      old_values,
      new_values
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
AS $function$
  SELECT public.is_admin_user();
$function$
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
  debug_info jsonb;
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

DROP FUNCTION IF EXISTS public.get_email_template_with_account(text);

CREATE OR REPLACE FUNCTION public.get_email_template_with_account(template_key_param text)
 RETURNS TABLE(template_id uuid, template_name text, subject text, header_html text, body_html text, footer_html text, variables jsonb, from_email text, from_name text)
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

  -- Get email from profiles table using a direct query
  -- This is safe because we're in a SECURITY DEFINER function
  SELECT email INTO user_email
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;

  -- Check if email matches admin domain
  RETURN user_email LIKE '%@sideby.ai';
EXCEPTION
  WHEN OTHERS THEN
    -- Return false on any error to be safe
    RETURN false;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT public.is_admin_user();
$function$
;

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
$function$
;

CREATE OR REPLACE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$function$
;

CREATE OR REPLACE FUNCTION storage.extension(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$function$
;

CREATE OR REPLACE FUNCTION storage.filename(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$function$
;

CREATE OR REPLACE FUNCTION storage.foldername(name text)
 RETURNS text[]
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$function$
;

CREATE OR REPLACE FUNCTION storage.get_size_by_bucket()
 RETURNS TABLE(size bigint, bucket_id text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$function$
;

CREATE OR REPLACE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text)
 RETURNS TABLE(key text, id text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text)
 RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.operation()
 RETURNS text
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text)
 RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
 LANGUAGE plpgsql
 STABLE
AS $function$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$function$
;

CREATE OR REPLACE FUNCTION storage.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$function$
;

create policy "Admin users can manage email accounts"
on "public"."email_accounts"
as permissive
for all
to public
using (is_current_user_admin())
with check (is_current_user_admin());


create policy "Admin users can manage header footer templates"
on "public"."email_header_footer_templates"
as permissive
for all
to public
using (is_current_user_admin())
with check (is_current_user_admin());


create policy "Admin users can manage email logs"
on "public"."email_send_logs"
as permissive
for all
to public
using (is_current_user_admin())
with check (is_current_user_admin());


create policy "Admin users can manage email templates"
on "public"."email_templates"
as permissive
for all
to public
using (is_current_user_admin())
with check (is_current_user_admin());


create policy "Users can create idea comments"
on "public"."idea_comments"
as permissive
for insert
to public
with check (((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)));


create policy "Users can delete their own idea comments"
on "public"."idea_comments"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can update their own idea comments"
on "public"."idea_comments"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view idea comments"
on "public"."idea_comments"
as permissive
for select
to public
using (true);


create policy "Admins can create messages on any idea"
on "public"."idea_discussion_messages"
as permissive
for insert
to public
with check (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))) AND (sender_type = 'admin'::text)));


create policy "Admins can view all messages"
on "public"."idea_discussion_messages"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


create policy "Users can create messages for their own ideas"
on "public"."idea_discussion_messages"
as permissive
for insert
to public
with check (((EXISTS ( SELECT 1
   FROM saved_items
  WHERE ((saved_items.id = idea_discussion_messages.idea_id) AND (saved_items.user_id = auth.uid())))) AND (sender_id = auth.uid()) AND (sender_type = 'user'::text)));


create policy "Users can view messages for their own ideas"
on "public"."idea_discussion_messages"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM saved_items
  WHERE ((saved_items.id = idea_discussion_messages.idea_id) AND (saved_items.user_id = auth.uid())))));


create policy "Admins can manage match pools"
on "public"."match_pools"
as permissive
for all
to public
using (is_admin_user());


create policy "Admins can create match suggestions"
on "public"."match_suggestions"
as permissive
for insert
to public
with check (is_admin_user());


create policy "Admins can update match suggestions"
on "public"."match_suggestions"
as permissive
for update
to public
using (is_admin_user());


create policy "Admins can view match suggestions"
on "public"."match_suggestions"
as permissive
for select
to public
using (is_admin_user());


create policy "Admin users can view all journey events"
on "public"."user_journey_events"
as permissive
for select
to public
using (is_admin_user());


create policy "System can insert journey events"
on "public"."user_journey_events"
as permissive
for insert
to public
with check (true);


create policy "Users can upload avatars"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));


create policy "Public Access"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'avatars'::text));


create policy "Users can delete their own avatars"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));


create policy "Users can update their own avatars"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));


CREATE TRIGGER ensure_user_profile_trigger AFTER INSERT OR UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION ensure_user_profile();

CREATE TRIGGER audit_email_accounts AFTER INSERT OR DELETE OR UPDATE ON public.email_accounts FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operations();

CREATE TRIGGER audit_email_templates AFTER INSERT OR DELETE OR UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operations();

CREATE TRIGGER audit_profiles AFTER DELETE OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operations();


