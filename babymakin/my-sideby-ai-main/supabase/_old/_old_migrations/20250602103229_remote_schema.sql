drop policy "Users can join communities" on "public"."community_members";

drop policy "Users can view posts based on visibility settings" on "public"."posts";

drop policy "Administrators can update all profiles" on "public"."profiles";

drop policy "Administrators can view all profiles" on "public"."profiles";

drop policy "Admins can update impersonating_user_id" on "public"."profiles";

drop policy "Allow admins to view all profiles" on "public"."profiles";

drop policy "Allow all users to view profiles for matches" on "public"."profiles";

drop policy "Allow only sideby.ai users to remove users" on "public"."profiles";

drop policy "Anyone can read profiles" on "public"."profiles";

drop policy "Public profiles are viewable by everyone" on "public"."profiles";

drop policy "Users can update their own subject statuses" on "public"."profiles";

drop policy "Users can view profiles of their matches" on "public"."profiles";

drop policy "Users can insert own pacing preferences" on "public"."user_pacing_preferences";

drop policy "Users can update own pacing preferences" on "public"."user_pacing_preferences";

drop policy "Users can view their own matches" on "public"."matches";

drop policy "Users can update their own notifications" on "public"."notifications";

drop policy "Users can view their own notifications" on "public"."notifications";

drop policy "Admin users can manage match announcements" on "public"."pending_match_announcements";

drop policy "Admins can manage post visibility" on "public"."post_visibility";

drop policy "Admin users can manage all experiments" on "public"."profile_experiments";

drop policy "Admins can view all profiles" on "public"."profiles";

drop policy "Users can insert their own profile" on "public"."profiles";

drop policy "Users can update own profile" on "public"."profiles";

drop policy "Users can view own profile" on "public"."profiles";

drop policy "Admins can manage all upduo user associations" on "public"."upduo_user_associations";

alter table "public"."journey_stage_config" drop column "reminder_times";

alter table "public"."journey_stage_config" drop column "welcome_email_delay_hours";

alter table "public"."journey_stage_config" drop column "welcome_email_enabled";

alter table "public"."journey_stage_config" add column "color" text;

alter table "public"."journey_stage_config" add column "deleted_at" timestamp with time zone;

alter table "public"."journey_stage_config" add column "display_order" integer default 0;

alter table "public"."journey_stage_config" add column "label" text;

alter table "public"."journey_stage_config" add column "value" text;

alter table "public"."profiles" add column "has_partial_reflection" boolean default false;

alter table "public"."profiles" add column "reflection_quality_score" integer default 0;

alter table "public"."upduo_transcripts" add column "quality_score" integer default 0;

alter table "public"."upduo_transcripts" add column "session_duration" integer default 0;

alter table "public"."upduo_transcripts" add column "word_count" integer default 0;

CREATE INDEX idx_journey_stage_config_order ON public.journey_stage_config USING btree (display_order);

CREATE INDEX idx_profiles_reflection_quality ON public.profiles USING btree (reflection_quality_score, has_completed_reflection);

CREATE INDEX idx_upduo_transcripts_quality ON public.upduo_transcripts USING btree (quality_score, session_duration);

CREATE UNIQUE INDEX journey_stage_config_value_unique ON public.journey_stage_config USING btree (value);

alter table "public"."crew_members" add constraint "fk_crew_members_user_id" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."crew_members" validate constraint "fk_crew_members_user_id";

alter table "public"."journey_stage_config" add constraint "journey_stage_config_value_unique" UNIQUE using index "journey_stage_config_value_unique";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_user_deletion_safety(user_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_info RECORD;
  safety_report jsonb := '{}';
  match_count integer;
  post_count integer;
  comment_count integer;
  is_admin boolean;
BEGIN
  -- Get user basic info
  SELECT first_name, last_name, email, created_at, status
  INTO user_info
  FROM profiles 
  WHERE id = user_id_param;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id_param AND email LIKE '%@sideby.ai'
  ) INTO is_admin;

  -- Count related data
  SELECT COUNT(*) INTO match_count
  FROM matches 
  WHERE user1_id = user_id_param OR user2_id = user_id_param;

  SELECT COUNT(*) INTO post_count
  FROM posts 
  WHERE user_id = user_id_param;

  SELECT COUNT(*) INTO comment_count
  FROM comments 
  WHERE user_id = user_id_param;

  safety_report := jsonb_build_object(
    'user_info', jsonb_build_object(
      'name', CONCAT(user_info.first_name, ' ', user_info.last_name),
      'email', user_info.email,
      'created_at', user_info.created_at,
      'status', user_info.status,
      'is_admin', is_admin
    ),
    'data_impact', jsonb_build_object(
      'matches', match_count,
      'posts', post_count,
      'comments', comment_count
    ),
    'warnings', CASE 
      WHEN is_admin THEN jsonb_build_array('User is an admin - deletion requires extra caution')
      WHEN match_count > 0 THEN jsonb_build_array('User has active matches that will be deleted')
      WHEN post_count > 10 THEN jsonb_build_array('User has significant community content that will be anonymized')
      ELSE jsonb_build_array()
    END
  );

  RETURN jsonb_build_object(
    'success', true,
    'safety_report', safety_report
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.ensure_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile if it doesn't exist
  INSERT INTO public.profiles (id, email, first_name, last_name, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'given_name'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'family_name'),
    CASE WHEN NEW.email LIKE '%@sideby.ai' THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name);
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_notification_preferences(user_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT COALESCE(notification_preferences, '{"email": true, "sms": false, "in_app": true}'::jsonb)
  FROM public.profiles 
  WHERE id = user_id;
$function$
;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND email LIKE '%@sideby.ai'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.user_exists(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = user_id
  );
$function$
;

create or replace view "public"."admin_user_availability_view" as  SELECT ua.id,
    ua.user_id,
    p.first_name,
    p.last_name,
    p.email,
    ua.pacing_level,
    ua.time_slots,
    ua.created_at,
    ua.updated_at
   FROM (user_availability ua
     LEFT JOIN profiles p ON ((ua.user_id = p.id)))
  WHERE (EXISTS ( SELECT 1
           FROM auth.users au
          WHERE ((au.id = auth.uid()) AND ((au.email)::text ~~ '%@sideby.ai'::text))));


CREATE OR REPLACE FUNCTION public.hard_delete_user_account(user_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  match_ids UUID[];
  deletion_results jsonb := '{}';
  total_deletions integer := 0;
  table_exists boolean;
BEGIN
  -- Verify user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id_param) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found',
      'deletions', deletion_results
    );
  END IF;

  -- Get all match IDs where this user is involved
  SELECT array_agg(id) INTO match_ids
  FROM matches 
  WHERE user1_id = user_id_param 
     OR user2_id = user_id_param 
     OR created_by = user_id_param;

  -- Delete match-related data (CASCADE tier 1)
  IF match_ids IS NOT NULL THEN
    -- Delete match meeting times
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_meeting_times') INTO table_exists;
    IF table_exists THEN
      DELETE FROM match_meeting_times WHERE match_id = ANY(match_ids);
      GET DIAGNOSTICS total_deletions = ROW_COUNT;
      deletion_results := jsonb_set(deletion_results, '{match_meeting_times}', to_jsonb(total_deletions));
    END IF;

    -- Delete match scheduling messages
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_scheduling_messages') INTO table_exists;
    IF table_exists THEN
      DELETE FROM match_scheduling_messages WHERE match_id = ANY(match_ids);
      GET DIAGNOSTICS total_deletions = ROW_COUNT;
      deletion_results := jsonb_set(deletion_results, '{match_scheduling_messages}', to_jsonb(total_deletions));
    END IF;

    -- Delete match admin messages
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_admin_messages') INTO table_exists;
    IF table_exists THEN
      DELETE FROM match_admin_messages WHERE match_id = ANY(match_ids);
      GET DIAGNOSTICS total_deletions = ROW_COUNT;
      deletion_results := jsonb_set(deletion_results, '{match_admin_messages}', to_jsonb(total_deletions));
    END IF;

    -- Delete match conversation analysis
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_conversation_analysis') INTO table_exists;
    IF table_exists THEN
      DELETE FROM match_conversation_analysis WHERE match_id = ANY(match_ids);
      GET DIAGNOSTICS total_deletions = ROW_COUNT;
      deletion_results := jsonb_set(deletion_results, '{match_conversation_analysis}', to_jsonb(total_deletions));
    END IF;

    -- Delete matches themselves
    DELETE FROM matches WHERE id = ANY(match_ids);
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{matches}', to_jsonb(total_deletions));
  END IF;

  -- Delete user-specific data (CASCADE tier 2) - only if tables exist
  
  -- Comments
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') INTO table_exists;
  IF table_exists THEN
    DELETE FROM comments WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{comments}', to_jsonb(total_deletions));
  END IF;

  -- Connections (skip completely - table doesn't exist in your schema)
  -- This table is not in your current schema, so we skip it entirely

  -- User tools
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_tools') INTO table_exists;
  IF table_exists THEN
    DELETE FROM user_tools WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{user_tools}', to_jsonb(total_deletions));
  END IF;

  -- User pacing preferences
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_pacing_preferences') INTO table_exists;
  IF table_exists THEN
    DELETE FROM user_pacing_preferences WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{user_pacing_preferences}', to_jsonb(total_deletions));
  END IF;

  -- User roles
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') INTO table_exists;
  IF table_exists THEN
    DELETE FROM user_roles WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{user_roles}', to_jsonb(total_deletions));
  END IF;

  -- Community members
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_members') INTO table_exists;
  IF table_exists THEN
    DELETE FROM community_members WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{community_members}', to_jsonb(total_deletions));
  END IF;

  -- Profile experiments
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profile_experiments') INTO table_exists;
  IF table_exists THEN
    DELETE FROM profile_experiments WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{profile_experiments}', to_jsonb(total_deletions));
  END IF;

  -- User availability
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_availability') INTO table_exists;
  IF table_exists THEN
    DELETE FROM user_availability WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{user_availability}', to_jsonb(total_deletions));
  END IF;

  -- Upduo transcripts
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'upduo_transcripts') INTO table_exists;
  IF table_exists THEN
    DELETE FROM upduo_transcripts WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{upduo_transcripts}', to_jsonb(total_deletions));
  END IF;

  -- Values acknowledgment
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'values_acknowledgment') INTO table_exists;
  IF table_exists THEN
    DELETE FROM values_acknowledgment WHERE id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{values_acknowledgment}', to_jsonb(total_deletions));
  END IF;

  -- Saved items
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_items') INTO table_exists;
  IF table_exists THEN
    DELETE FROM saved_items WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{saved_items}', to_jsonb(total_deletions));
  END IF;

  -- Engagement logs
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'engagement_logs') INTO table_exists;
  IF table_exists THEN
    DELETE FROM engagement_logs WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{engagement_logs}', to_jsonb(total_deletions));
  END IF;

  -- Engagement stats
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'engagement_stats') INTO table_exists;
  IF table_exists THEN
    DELETE FROM engagement_stats WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{engagement_stats}', to_jsonb(total_deletions));
  END IF;

  -- User custom tools
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_custom_tools') INTO table_exists;
  IF table_exists THEN
    DELETE FROM user_custom_tools WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{user_custom_tools}', to_jsonb(total_deletions));
  END IF;

  -- User session schedules
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_session_schedules') INTO table_exists;
  IF table_exists THEN
    DELETE FROM user_session_schedules WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{user_session_schedules}', to_jsonb(total_deletions));
  END IF;

  -- Sponsorships
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sponsorships') INTO table_exists;
  IF table_exists THEN
    DELETE FROM sponsorships WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{sponsorships}', to_jsonb(total_deletions));
  END IF;

  -- Event participants (if exists)
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_participants') INTO table_exists;
  IF table_exists THEN
    DELETE FROM event_participants WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{event_participants}', to_jsonb(total_deletions));
  END IF;

  -- Notifications and pending notifications
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') INTO table_exists;
  IF table_exists THEN
    DELETE FROM notifications WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{notifications}', to_jsonb(total_deletions));
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pending_notifications') INTO table_exists;
  IF table_exists THEN
    DELETE FROM pending_notifications WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{pending_notifications}', to_jsonb(total_deletions));
  END IF;

  -- Handle posts (anonymize instead of delete to preserve community content)
  UPDATE posts 
  SET user_id = NULL, status = 'deleted'
  WHERE user_id = user_id_param;
  GET DIAGNOSTICS total_deletions = ROW_COUNT;
  deletion_results := jsonb_set(deletion_results, '{posts_anonymized}', to_jsonb(total_deletions));

  -- Delete post visibility settings created by this user
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'post_visibility') INTO table_exists;
  IF table_exists THEN
    DELETE FROM post_visibility WHERE created_by = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{post_visibility}', to_jsonb(total_deletions));
  END IF;

  -- Handle process gaps (nullify references instead of delete)
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'process_gaps') INTO table_exists;
  IF table_exists THEN
    UPDATE process_gaps 
    SET created_by = NULL 
    WHERE created_by = user_id_param;
    
    UPDATE process_gaps 
    SET closed_by = NULL 
    WHERE closed_by = user_id_param;
    
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{process_gaps_nullified}', to_jsonb(total_deletions));
  END IF;

  -- Finally delete the profile itself (CASCADE tier 3)
  DELETE FROM profiles WHERE id = user_id_param;
  GET DIAGNOSTICS total_deletions = ROW_COUNT;
  deletion_results := jsonb_set(deletion_results, '{profiles}', to_jsonb(total_deletions));

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User and all related data successfully deleted',
    'deletions', deletion_results
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_sideby_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = user_id 
    AND email LIKE '%@sideby.ai'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_sideby_admin_from_profile(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = user_id 
    AND email LIKE '%@sideby.ai'
  );
$function$
;

create policy "Authenticated users can view communities"
on "public"."communities"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


create policy "Communities are viewable by authenticated users"
on "public"."communities"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


create policy "Admins can view all community memberships"
on "public"."community_members"
as permissive
for all
to authenticated
using (is_current_user_admin());


create policy "Users can insert their own community membership"
on "public"."community_members"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can manage own community membership"
on "public"."community_members"
as permissive
for all
to public
using (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text))))));


create policy "Users can manage their own community memberships"
on "public"."community_members"
as permissive
for all
to authenticated
using ((auth.uid() = user_id));


create policy "Users can view their own community memberships"
on "public"."community_members"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Admins can manage all matches"
on "public"."matches"
as permissive
for all
to authenticated
using (is_current_user_admin());


create policy "Admins can manage all notifications"
on "public"."notifications"
as permissive
for all
to authenticated
using (is_current_user_admin());


create policy "notifications_insert_own"
on "public"."notifications"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "notifications_select_own"
on "public"."notifications"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "notifications_update_own"
on "public"."notifications"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Users can delete own profile"
on "public"."profiles"
as permissive
for delete
to public
using ((id = get_current_user_id()));


create policy "Users can insert own profile"
on "public"."profiles"
as permissive
for insert
to public
with check ((id = get_current_user_id()));


create policy "Users can update their own profile"
on "public"."profiles"
as permissive
for update
to authenticated
using ((auth.uid() = id));


create policy "Users can view profiles of their match partners"
on "public"."profiles"
as permissive
for select
to public
using (((auth.uid() = id) OR (EXISTS ( SELECT 1
   FROM matches
  WHERE ((((matches.user1_id = auth.uid()) AND (matches.user2_id = profiles.id)) OR ((matches.user2_id = auth.uid()) AND (matches.user1_id = profiles.id))) AND (matches.status = 'active'::text)))) OR is_sideby_admin_from_profile(auth.uid())));


create policy "Admins can view all pacing preferences"
on "public"."user_pacing_preferences"
as permissive
for all
to authenticated
using (is_current_user_admin());


create policy "Users can insert their own pacing preferences"
on "public"."user_pacing_preferences"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can manage own pacing preferences"
on "public"."user_pacing_preferences"
as permissive
for all
to public
using (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text))))));


create policy "Users can manage their own pacing preferences"
on "public"."user_pacing_preferences"
as permissive
for all
to authenticated
using ((auth.uid() = user_id));


create policy "Admins can view all values acknowledgments"
on "public"."values_acknowledgment"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text ~~ '%@sideby.ai'::text)))));


create policy "Enable insert access for users on own values acknowledgment"
on "public"."values_acknowledgment"
as permissive
for insert
to public
with check ((id = get_current_user_id()));


create policy "Enable read access for users on own values acknowledgment"
on "public"."values_acknowledgment"
as permissive
for select
to public
using ((id = get_current_user_id()));


create policy "Users can insert their own acknowledgment"
on "public"."values_acknowledgment"
as permissive
for insert
to public
with check (((auth.uid() = id) OR is_current_user_admin()));


create policy "Users can insert their own values acknowledgment"
on "public"."values_acknowledgment"
as permissive
for insert
to public
with check (((id = get_current_user_id()) OR is_current_user_admin()));


create policy "Users can manage own values acknowledgment"
on "public"."values_acknowledgment"
as permissive
for all
to public
using (((auth.uid() = id) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text))))));


create policy "Users can manage their own values acknowledgment"
on "public"."values_acknowledgment"
as permissive
for all
to authenticated
using ((auth.uid() = id));


create policy "Users can view their own acknowledgment"
on "public"."values_acknowledgment"
as permissive
for select
to public
using (((auth.uid() = id) OR is_current_user_admin()));


create policy "Users can view their own values acknowledgment"
on "public"."values_acknowledgment"
as permissive
for select
to public
using (((id = get_current_user_id()) OR is_current_user_admin()));


create policy "values_acknowledgment_insert_own"
on "public"."values_acknowledgment"
as permissive
for insert
to public
with check ((id = auth.uid()));


create policy "values_acknowledgment_select_own"
on "public"."values_acknowledgment"
as permissive
for select
to public
using ((id = auth.uid()));


create policy "Users can view their own matches"
on "public"."matches"
as permissive
for select
to authenticated
using (((auth.uid() = user1_id) OR (auth.uid() = user2_id)));


create policy "Users can update their own notifications"
on "public"."notifications"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "Users can view their own notifications"
on "public"."notifications"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Admin users can manage match announcements"
on "public"."pending_match_announcements"
as permissive
for all
to public
using (is_sideby_admin(auth.uid()))
with check (is_sideby_admin(auth.uid()));


create policy "Admins can manage post visibility"
on "public"."post_visibility"
as permissive
for all
to public
using (is_sideby_admin(auth.uid()))
with check (is_sideby_admin(auth.uid()));


create policy "Admin users can manage all experiments"
on "public"."profile_experiments"
as permissive
for all
to public
using (is_sideby_admin(auth.uid()))
with check (is_sideby_admin(auth.uid()));


create policy "Admins can view all profiles"
on "public"."profiles"
as permissive
for all
to authenticated
using (is_current_user_admin());


create policy "Users can insert their own profile"
on "public"."profiles"
as permissive
for insert
to public
with check (((id = get_current_user_id()) OR is_current_user_admin()));


create policy "Users can update own profile"
on "public"."profiles"
as permissive
for update
to public
using ((id = get_current_user_id()))
with check ((id = get_current_user_id()));


create policy "Users can view own profile"
on "public"."profiles"
as permissive
for select
to public
using ((id = get_current_user_id()));


create policy "Admins can manage all upduo user associations"
on "public"."upduo_user_associations"
as permissive
for all
to public
using (is_sideby_admin(auth.uid()))
with check (is_sideby_admin(auth.uid()));



