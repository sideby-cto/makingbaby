
drop view if exists "public"."admin_user_availability_view";

drop view if exists "public"."user_pacing_preferences_with_names";

create table "public"."match_user_notes" (
    "id" uuid not null default gen_random_uuid(),
    "match_id" uuid not null,
    "user_id" uuid not null,
    "content" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."match_user_notes" enable row level security;

alter table "public"."posts" alter column "user_id" drop not null;

alter table "public"."profiles" add column "location" text;

alter table "public"."user_custom_tools" add column "description" text;

alter table "public"."user_custom_tools" add column "type" text not null default 'custom'::text;

CREATE INDEX idx_match_user_notes_match_user ON public.match_user_notes USING btree (match_id, user_id);

CREATE INDEX idx_user_custom_tools_user_type ON public.user_custom_tools USING btree (user_id, type);

CREATE UNIQUE INDEX match_user_notes_pkey ON public.match_user_notes USING btree (id);

CREATE UNIQUE INDEX unique_user_match_note ON public.match_user_notes USING btree (match_id, user_id);

alter table "public"."match_user_notes" add constraint "match_user_notes_pkey" PRIMARY KEY using index "match_user_notes_pkey";

alter table "public"."match_user_notes" add constraint "match_user_notes_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE not valid;

alter table "public"."match_user_notes" validate constraint "match_user_notes_match_id_fkey";

alter table "public"."match_user_notes" add constraint "unique_user_match_note" UNIQUE using index "unique_user_match_note";

alter table "public"."user_custom_tools" add constraint "user_custom_tools_type_check" CHECK ((type = ANY (ARRAY['predefined'::text, 'custom'::text]))) not valid;

alter table "public"."user_custom_tools" validate constraint "user_custom_tools_type_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.completely_delete_match(match_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  deletion_results jsonb := '{}';
  total_deletions integer := 0;
  match_exists boolean := false;
  table_exists boolean;
BEGIN
  -- Check if match exists
  SELECT EXISTS (SELECT 1 FROM matches WHERE id = match_id_param) INTO match_exists;
  
  IF NOT match_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Match not found',
      'deletions', deletion_results
    );
  END IF;

  -- Delete match user notes
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_user_notes') INTO table_exists;
  IF table_exists THEN
    DELETE FROM match_user_notes WHERE match_id = match_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{match_user_notes}', to_jsonb(total_deletions));
  END IF;

  -- Delete match meeting times
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_meeting_times') INTO table_exists;
  IF table_exists THEN
    DELETE FROM match_meeting_times WHERE match_id = match_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{match_meeting_times}', to_jsonb(total_deletions));
  END IF;

  -- Delete match scheduling messages
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_scheduling_messages') INTO table_exists;
  IF table_exists THEN
    DELETE FROM match_scheduling_messages WHERE match_id = match_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{match_scheduling_messages}', to_jsonb(total_deletions));
  END IF;

  -- Delete match admin messages
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_admin_messages') INTO table_exists;
  IF table_exists THEN
    DELETE FROM match_admin_messages WHERE match_id = match_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{match_admin_messages}', to_jsonb(total_deletions));
  END IF;

  -- Delete match conversation analysis
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_conversation_analysis') INTO table_exists;
  IF table_exists THEN
    DELETE FROM match_conversation_analysis WHERE match_id = match_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{match_conversation_analysis}', to_jsonb(total_deletions));
  END IF;

  -- Delete pending match announcements
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pending_match_announcements') INTO table_exists;
  IF table_exists THEN
    DELETE FROM pending_match_announcements WHERE match_id = match_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{pending_match_announcements}', to_jsonb(total_deletions));
  END IF;

  -- Delete admin alerts related to this match
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_alerts') INTO table_exists;
  IF table_exists THEN
    DELETE FROM admin_alerts WHERE match_id = match_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{admin_alerts}', to_jsonb(total_deletions));
  END IF;

  -- Delete notifications related to this match
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') INTO table_exists;
  IF table_exists THEN
    DELETE FROM notifications WHERE data->>'match_id' = match_id_param::text;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{notifications}', to_jsonb(total_deletions));
  END IF;

  -- Delete pending notifications related to this match
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pending_notifications') INTO table_exists;
  IF table_exists THEN
    DELETE FROM pending_notifications WHERE data->>'match_id' = match_id_param::text;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{pending_notifications}', to_jsonb(total_deletions));
  END IF;

  -- Delete posts related to this match
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'posts') INTO table_exists;
  IF table_exists THEN
    DELETE FROM posts WHERE match_id = match_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{posts}', to_jsonb(total_deletions));
  END IF;

  -- Finally delete the match itself
  DELETE FROM matches WHERE id = match_id_param;
  GET DIAGNOSTICS total_deletions = ROW_COUNT;
  deletion_results := jsonb_set(deletion_results, '{matches}', to_jsonb(total_deletions));

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Match and all related data successfully deleted',
    'deletions', deletion_results
  );
END;
$function$
;

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
    -- Delete match user notes
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_user_notes') INTO table_exists;
    IF table_exists THEN
      DELETE FROM match_user_notes WHERE match_id = ANY(match_ids);
      GET DIAGNOSTICS total_deletions = ROW_COUNT;
      deletion_results := jsonb_set(deletion_results, '{match_user_notes}', to_jsonb(total_deletions));
    END IF;

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

  -- CRITICAL: Delete notification_delivery_logs BEFORE notifications (to prevent FK violations)
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notification_delivery_logs') INTO table_exists;
  IF table_exists THEN
    -- Delete delivery logs for notifications belonging to this user
    DELETE FROM notification_delivery_logs 
    WHERE notification_id IN (
      SELECT id FROM notifications WHERE user_id = user_id_param
    ) OR notification_id IN (
      SELECT id FROM pending_notifications WHERE user_id = user_id_param
    );
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{notification_delivery_logs}', to_jsonb(total_deletions));
  END IF;

  -- Delete user-specific data (CASCADE tier 2) - only if tables exist
  
  -- Comments
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') INTO table_exists;
  IF table_exists THEN
    DELETE FROM comments WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{comments}', to_jsonb(total_deletions));
  END IF;

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

  -- Event participants
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_participants') INTO table_exists;
  IF table_exists THEN
    DELETE FROM event_participants WHERE user_id = user_id_param;
    GET DIAGNOSTICS total_deletions = ROW_COUNT;
    deletion_results := jsonb_set(deletion_results, '{event_participants}', to_jsonb(total_deletions));
  END IF;

  -- Notifications and pending notifications (AFTER notification_delivery_logs are deleted)
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
$function$;

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


create or replace view "public"."user_pacing_preferences_with_names" as  SELECT upp.id,
    upp.user_id,
    upp.community_id,
    upp.pacing_level,
    upp.created_at,
    upp.updated_at,
    upp.session_time,
    p.first_name
   FROM (user_pacing_preferences upp
     JOIN profiles p ON ((p.id = upp.user_id)));


grant delete on table "public"."match_user_notes" to "anon";

grant insert on table "public"."match_user_notes" to "anon";

grant references on table "public"."match_user_notes" to "anon";

grant select on table "public"."match_user_notes" to "anon";

grant trigger on table "public"."match_user_notes" to "anon";

grant truncate on table "public"."match_user_notes" to "anon";

grant update on table "public"."match_user_notes" to "anon";

grant delete on table "public"."match_user_notes" to "authenticated";

grant insert on table "public"."match_user_notes" to "authenticated";

grant references on table "public"."match_user_notes" to "authenticated";

grant select on table "public"."match_user_notes" to "authenticated";

grant trigger on table "public"."match_user_notes" to "authenticated";

grant truncate on table "public"."match_user_notes" to "authenticated";

grant update on table "public"."match_user_notes" to "authenticated";

grant delete on table "public"."match_user_notes" to "service_role";

grant insert on table "public"."match_user_notes" to "service_role";

grant references on table "public"."match_user_notes" to "service_role";

grant select on table "public"."match_user_notes" to "service_role";

grant trigger on table "public"."match_user_notes" to "service_role";

grant truncate on table "public"."match_user_notes" to "service_role";

grant update on table "public"."match_user_notes" to "service_role";

create policy "Users can create their own match notes"
on "public"."match_user_notes"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can delete their own match notes"
on "public"."match_user_notes"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can update their own match notes"
on "public"."match_user_notes"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own match notes"
on "public"."match_user_notes"
as permissive
for select
to public
using ((auth.uid() = user_id));

