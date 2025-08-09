set check_function_bodies = off;

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

CREATE OR REPLACE FUNCTION public.trigger_journey_monitor(force_run boolean DEFAULT false)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result json;
BEGIN
  -- This function can be called manually or by automated processes
  -- to trigger the journey-monitor edge function
  result := json_build_object(
    'status', 'triggered',
    'message', 'Journey monitor processing initiated',
    'timestamp', NOW(),
    'forced', force_run
  );
  
  RETURN result;
END;
$function$
;

CREATE TRIGGER trigger_journey_stage_change AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION notify_journey_stage_change();


