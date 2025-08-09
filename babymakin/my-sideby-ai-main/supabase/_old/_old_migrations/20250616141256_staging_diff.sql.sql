CREATE EXTENSION "vector" WITH SCHEMA "public" VERSION "0.8.0";

CREATE TYPE "public"."admin_role" AS ENUM ('guide', 'admin');

CREATE TYPE "public"."app_role" AS ENUM ('community_manager', 'member');

CREATE TYPE "public"."beta_feature" AS ENUM ('video_intro', 'transcription', 'newUserFlowBeta');

CREATE TYPE "public"."email_account_type" AS ENUM ('robot', 'team', 'info', 'notifications');

CREATE TYPE "public"."feature_flag_type" AS ENUM ('new_dashboard', 'experimental_tools', 'advanced_analytics', 'beta_features');

CREATE TYPE "public"."gap_status" AS ENUM ('open', 'closed');

CREATE TYPE "public"."match_analysis_type" AS ENUM ('stance', 'learning', 'touchpoint', 'disagreement');

CREATE TYPE "public"."pacing_level" AS ENUM ('light', 'moderate', 'consistent', 'deep_dive');

CREATE TYPE "public"."saved_item_type" AS ENUM ('microtranslation', 'idea', 'resource');

CREATE TYPE "public"."session_frequency" AS ENUM ('weekly', 'biweekly', 'thrice_weekly');

CREATE TYPE "public"."session_time" AS ENUM ('9AM', '12PM', '3PM', '6PM');

CREATE TYPE "public"."template_status" AS ENUM ('active', 'draft', 'archived');

CREATE TYPE "public"."tool_type" AS ENUM ('chatgpt_plus', 'lovable_dev', 'descript', 'upduo');

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.accept_hat_detection(p_detection_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user_id UUID;
  v_hat_name TEXT;
  v_subject_statuses JSONB[];
  v_source TEXT;
  v_session_id TEXT;
BEGIN
  -- Get detection details
  SELECT 
    user_id, 
    hat_name,
    source,
    session_id
  INTO 
    v_user_id, 
    v_hat_name,
    v_source,
    v_session_id
  FROM public.hat_detections
  WHERE id = p_detection_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Mark detection as approved
  UPDATE public.hat_detections
  SET status = 'approved', updated_at = now()
  WHERE id = p_detection_id;
  
  -- Get current subject statuses
  SELECT subject_statuses INTO v_subject_statuses
  FROM profiles
  WHERE id = v_user_id;
  
  -- Add hat to subject_statuses
  v_subject_statuses := array_append(
    v_subject_statuses, 
    jsonb_build_object('name', v_hat_name, 'status', 'active')
  );
  
  -- Update profile
  UPDATE profiles
  SET subject_statuses = v_subject_statuses
  WHERE id = v_user_id;
  
  -- Record metadata about the source
  INSERT INTO public.hat_metadata (
    user_id, 
    hat_name, 
    source, 
    session_id
  ) VALUES (
    v_user_id,
    v_hat_name,
    v_source,
    v_session_id
  );
  
  RETURN TRUE;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.admin_add_beta_user(user_id uuid, features_array beta_feature[])
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only administrators can add beta users';
  END IF;
  
  -- Insert the beta user
  INSERT INTO public.beta_users (user_id, features)
  VALUES (user_id, features_array);
  
  RETURN true;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.admin_pre_enroll_beta_user(email_address text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only administrators can pre-enroll beta users';
  END IF;
  
  -- Insert the email into pending enrollments
  INSERT INTO public.beta_user_pending_emails (email, status)
  VALUES (email_address, 'pending');
  
  RETURN true;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.admin_remove_beta_user(beta_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only administrators can remove beta users';
  END IF;
  
  -- Delete the beta user
  DELETE FROM public.beta_users WHERE id = beta_user_id;
  
  RETURN true;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.admin_remove_pending_beta_email(email_address text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only administrators can remove pending beta emails';
  END IF;
  
  -- Delete the pending email
  DELETE FROM public.beta_user_pending_emails WHERE email = email_address;
  
  RETURN true;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
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

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.auto_enroll_beta_users()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Check if the new user's email is in the pending enrollment list
    IF EXISTS (
        SELECT 1 FROM public.beta_user_pending_emails
        WHERE email = NEW.email
    ) THEN
        -- Add the user to beta program
        INSERT INTO public.beta_users (user_id, features)
        VALUES (NEW.id, ARRAY['newUserFlowBeta']::beta_feature[]);
        
        -- Remove from pending list
        DELETE FROM public.beta_user_pending_emails
        WHERE email = NEW.email;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_complete_matches(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id 
    AND email LIKE '%@sideby.ai'
  );
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.check_column_exists(table_name text, column_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
      AND column_name = $2
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
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
  -- Get user basic info from profiles table
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

  -- Check if user is admin using profiles table
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
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

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.clean_test_schema()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE 
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'testing'
    LOOP
        EXECUTE format('TRUNCATE TABLE testing.%I CASCADE', r.tablename);
    END LOOP;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
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

CREATE OR REPLACE FUNCTION public.count_user_matches(user_id uuid)
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT COUNT(*)::integer 
  FROM public.matches
  WHERE (user1_id = user_id OR user2_id = user_id)
  AND status = 'active';
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.create_hat_detection(p_user_id uuid, p_hat_name text, p_source text DEFAULT 'session_transcript'::text, p_confidence double precision DEFAULT NULL::double precision, p_session_id text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_detection_id UUID;
BEGIN
  -- Check if a similar detection already exists
  SELECT id INTO v_detection_id
  FROM public.hat_detections
  WHERE user_id = p_user_id
  AND hat_name = p_hat_name
  AND status = 'pending'
  LIMIT 1;
  
  -- If it exists, just return that ID
  IF v_detection_id IS NOT NULL THEN
    RETURN v_detection_id;
  END IF;
  
  -- Otherwise create a new detection
  INSERT INTO public.hat_detections (
    user_id, 
    hat_name, 
    source, 
    confidence, 
    session_id, 
    metadata
  ) VALUES (
    p_user_id,
    p_hat_name,
    p_source,
    p_confidence,
    p_session_id,
    p_metadata
  )
  RETURNING id INTO v_detection_id;
  
  RETURN v_detection_id;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.create_notification_entry(p_receiver_id uuid, p_sender_id uuid, p_message_content text, p_match_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  sender_name TEXT;
  notification_prefs JSONB;
  formatted_content TEXT;
  sender_type TEXT;
BEGIN
  -- Get notification preferences for the receiver
  SELECT notification_preferences INTO notification_prefs 
  FROM profiles 
  WHERE id = p_receiver_id;
  
  -- Determine sender type from match_scheduling_messages
  SELECT msg.sender_type INTO sender_type
  FROM match_scheduling_messages msg
  WHERE msg.match_id = p_match_id 
  AND msg.sender_id = p_sender_id
  ORDER BY msg.created_at DESC
  LIMIT 1;
  
  -- Get sender name based on sender_type
  IF sender_type = 'admin' THEN
    sender_name := 'Sideby Admin';
  ELSE
    -- For regular users, get name from profiles
    SELECT 
      COALESCE(first_name || ' ' || last_name, 'User') INTO sender_name
    FROM profiles 
    WHERE id = p_sender_id;
  END IF;
  
  -- Format content
  formatted_content := p_message_content;
  IF LENGTH(p_message_content) > 50 THEN
    formatted_content := SUBSTRING(p_message_content, 1, 50) || '...';
  END IF;
  
  -- Create email notification if user has email notifications enabled
  IF (notification_prefs->>'email')::boolean = true THEN
    INSERT INTO public.pending_notifications (
      user_id,
      notification_type,
      channel,
      title,
      content,
      data
    ) VALUES (
      p_receiver_id,
      'match_message',
      'email',
      'New message from ' || COALESCE(sender_name, 'your match'),
      formatted_content,
      jsonb_build_object('match_id', p_match_id, 'sender_name', sender_name)
    );
  END IF;
  
  -- Create SMS notification if user has SMS notifications enabled
  IF (notification_prefs->>'sms')::boolean = true THEN
    -- Only create SMS notifications if the user's phone is verified
    IF (SELECT phone_verified FROM profiles WHERE id = p_receiver_id) = true THEN
      INSERT INTO public.pending_notifications (
        user_id,
        notification_type,
        channel,
        title,
        content,
        data
      ) VALUES (
        p_receiver_id,
        'match_message',
        'sms',
        'New message',
        'From ' || COALESCE(sender_name, 'your match') || ': ' || formatted_content,
        jsonb_build_object('match_id', p_match_id, 'sender_name', sender_name)
      );
    END IF;
  END IF;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
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

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  match_ids UUID[];
BEGIN
  -- Get all match IDs where this user is involved to handle related tables
  SELECT array_agg(id) INTO match_ids
  FROM matches 
  WHERE user1_id = user_id_param 
     OR user2_id = user_id_param 
     OR created_by = user_id_param;

  -- Delete records from dependent tables in the correct order
  -- Match-related tables
  IF match_ids IS NOT NULL THEN
    DELETE FROM match_meeting_times WHERE match_id = ANY(match_ids);
    DELETE FROM match_scheduling_messages WHERE match_id = ANY(match_ids);
    DELETE FROM match_admin_messages WHERE match_id = ANY(match_ids);
    DELETE FROM match_conversation_analysis WHERE match_id = ANY(match_ids);
    DELETE FROM matches WHERE id = ANY(match_ids);
  END IF;

  -- Delete user's comments
  DELETE FROM comments WHERE user_id = user_id_param;
  
  -- Update user's posts to anonymize them instead of deleting
  -- This preserves community content while removing personal identifiers
  UPDATE posts 
  SET user_id = NULL,
      status = 'anonymous'
  WHERE user_id = user_id_param;
  
  -- Delete post visibility settings created by this user
  DELETE FROM post_visibility WHERE created_by = user_id_param;
  
  -- Delete user's connections
  DELETE FROM connections 
  WHERE user_id = user_id_param OR connected_user_id = user_id_param;
  
  -- Delete from all other related tables 
  DELETE FROM user_tools WHERE user_id = user_id_param;
  DELETE FROM user_pacing_preferences WHERE user_id = user_id_param;
  DELETE FROM user_roles WHERE user_id = user_id_param;
  DELETE FROM community_members WHERE user_id = user_id_param;
  DELETE FROM profile_experiments WHERE user_id = user_id_param;
  DELETE FROM user_availability WHERE user_id = user_id_param;
  DELETE FROM upduo_transcripts WHERE user_id = user_id_param;
  DELETE FROM values_acknowledgment WHERE id = user_id_param;
  DELETE FROM saved_items WHERE user_id = user_id_param;
  DELETE FROM engagement_logs WHERE user_id = user_id_param;
  DELETE FROM engagement_stats WHERE user_id = user_id_param;
  DELETE FROM user_custom_tools WHERE user_id = user_id_param;
  DELETE FROM user_session_schedules WHERE user_id = user_id_param;
  DELETE FROM sponsorships WHERE user_id = user_id_param;
  DELETE FROM resources WHERE user_id = user_id_param;
  DELETE FROM event_participants WHERE user_id = user_id_param;
  
  -- Process gaps - update rather than delete to maintain system integrity
  UPDATE process_gaps 
  SET created_by = NULL 
  WHERE created_by = user_id_param;
  
  UPDATE process_gaps 
  SET closed_by = NULL 
  WHERE closed_by = user_id_param;
  
  -- Finally delete the profile itself
  DELETE FROM profiles WHERE id = user_id_param;
  
  RETURN TRUE;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.enforce_match_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Check if the user creating the match is an admin
  IF public.is_sideby_admin(NEW.created_by) THEN
    -- Admin users can have up to 25 matches
    IF public.count_user_matches(NEW.user1_id) >= 25 OR public.count_user_matches(NEW.user2_id) >= 25 THEN
      RAISE EXCEPTION 'Maximum number of matches (25) reached for one of the users';
    END IF;
  ELSE
    -- Regular users can only have 1 match
    IF public.count_user_matches(NEW.user1_id) >= 1 OR public.count_user_matches(NEW.user2_id) >= 1 THEN
      RAISE EXCEPTION 'Maximum number of matches (1) reached for one of the users';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
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

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.get_community_members(community_id_param uuid)
 RETURNS TABLE(community_id uuid, first_name text, last_initial text, pacing_level text, role text, status text)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    cm.community_id,
    p.first_name,
    SUBSTRING(p.last_name, 1, 1) AS last_initial,
    COALESCE(upp.pacing_level, 'not_set') AS pacing_level,
    COALESCE(ur.role, 'member') AS role,
    cm.status
  FROM 
    community_members cm
  JOIN 
    profiles p ON cm.user_id = p.id
  LEFT JOIN 
    user_roles ur ON cm.user_id = ur.user_id AND cm.community_id = ur.community_id
  LEFT JOIN 
    user_pacing_preferences upp ON cm.user_id = upp.user_id AND cm.community_id = upp.community_id
  WHERE 
    cm.community_id = community_id_param;
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

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
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

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.get_email_template_with_account_safe(template_key_param text)
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
  FROM public.email_templates et
  JOIN public.email_accounts ea ON et.account_type = ea.account_type
  WHERE et.template_key = template_key_param 
    AND et.status = 'active';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_data(user_id uuid)
 RETURNS json
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    json_build_object(
      'id', id,
      'email', email,
      'created_at', created_at,
      'updated_at', updated_at
    )
  FROM public.profiles
  WHERE id = user_id;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.get_user_last_signin(user_id uuid)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  last_signin timestamp with time zone;
BEGIN
  -- Only allow access if the requesting user is an admin or requesting their own data
  IF auth.uid() != user_id AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND email LIKE '%@sideby.ai'
  ) THEN
    RETURN NULL;
  END IF;
  
  -- This function needs auth.users access for last_sign_in_at
  -- We'll use a safer approach with error handling
  BEGIN
    SELECT last_sign_in_at INTO last_signin
    FROM auth.users
    WHERE id = user_id;
  EXCEPTION
    WHEN insufficient_privilege THEN
      -- If we can't access auth.users, return NULL
      RETURN NULL;
  END;
  
  RETURN last_signin;
END;
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

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
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

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.get_weekly_session_counts(start_date date, end_date date)
 RETURNS TABLE(week_start date, selected_sessions integer, kept_sessions integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH RECURSIVE weeks AS (
        SELECT start_date AS week_start
        UNION ALL
        SELECT weeks.week_start + 7
        FROM weeks
        WHERE weeks.week_start + 7 <= end_date
    ),
    pacing_counts AS (
        SELECT 
            w.week_start,
            COUNT(DISTINCT CASE WHEN upp.pacing_level = 'light' THEN upp.user_id || ':' || upp.community_id END) * 1 as light_count,
            COUNT(DISTINCT CASE WHEN upp.pacing_level = 'moderate' THEN upp.user_id || ':' || upp.community_id END) * 2 as moderate_count,
            COUNT(DISTINCT CASE WHEN upp.pacing_level = 'consistent' THEN upp.user_id || ':' || upp.community_id END) * 4 as consistent_count,
            COUNT(DISTINCT CASE WHEN upp.pacing_level = 'deep_dive' THEN upp.user_id || ':' || upp.community_id END) * 12 as deep_dive_count
        FROM weeks w
        CROSS JOIN user_pacing_preferences upp
        GROUP BY w.week_start
    )
    SELECT 
        w.week_start,
        COALESCE(
            pc.light_count + 
            pc.moderate_count + 
            pc.consistent_count + 
            pc.deep_dive_count,
            0
        )::INTEGER as selected_sessions,
        (COALESCE(
            pc.light_count + 
            pc.moderate_count + 
            pc.consistent_count + 
            pc.deep_dive_count,
            0
        ) * 0.8)::INTEGER as kept_sessions
    FROM weeks w
    LEFT JOIN pacing_counts pc ON w.week_start = pc.week_start
    ORDER BY w.week_start;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.handle_admin_message()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  admin_uuid UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Check if sender_type is explicitly set to 'admin'
  IF NEW.sender_type = 'admin' THEN
    -- Make sure sender_id is a valid UUID
    -- Note: We don't replace sender_id with admin_uuid anymore
    -- We keep the actual admin user's UUID but mark it with sender_type
    NULL;
  
  -- Legacy handling for old-style admin messages
  ELSIF NEW.sender_id::text LIKE '%@%' OR 
     NEW.sender_id::text = 'admin' OR 
     NEW.sender_id::text = 'robot@sideby' THEN
    -- Mark as admin message
    NEW.sender_type := 'admin';
    
    -- Only replace non-UUID sender_ids with placeholder
    IF NOT (NEW.sender_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
      NEW.sender_id := admin_uuid;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.handle_match_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  service_role_key text;
BEGIN
  -- Get the service role key from the secrets table
  SELECT decrypted_secret INTO service_role_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';

  -- Call the match-email-webhook function to send emails to both users
  PERFORM
    net.http_post(
      url := 'https://upffcxqiozqhdgfesmji.supabase.co/functions/v1/match-email-webhook',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'record', NEW
      )
    );
  
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.email LIKE '%@sideby.ai' THEN
    INSERT INTO public.admin_users (id, role)
    VALUES (NEW.id, 'guide')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.handle_new_chat_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  service_role_key text;
BEGIN
  -- Get the service role key from the secrets table
  SELECT decrypted_secret INTO service_role_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';

  -- Call the send-match-email function for new messages
  PERFORM
    net.http_post(
      url := 'https://upffcxqiozqhdgfesmji.supabase.co/functions/v1/send-match-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'matchId', NEW.match_id,
        'senderId', NEW.sender_id,
        'content', NEW.content
      )
    );
  
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.handle_new_match_notification()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  user1_name TEXT;
  user2_name TEXT;
BEGIN
  -- Get names for both users
  SELECT first_name INTO user1_name FROM public.profiles WHERE id = NEW.user1_id;
  SELECT first_name INTO user2_name FROM public.profiles WHERE id = NEW.user2_id;
  
  -- Create notification for user1
  INSERT INTO public.notifications (
    user_id, 
    type, 
    title, 
    content, 
    data
  ) VALUES (
    NEW.user1_id, 
    'match_created', 
    'New Learning Connection', 
    'You have been matched with ' || COALESCE(user2_name, 'another educator') || '. Go to your dashboard to connect!',
    jsonb_build_object('match_id', NEW.id, 'partner_id', NEW.user2_id, 'partner_name', user2_name)
  );
  
  -- Create notification for user2
  INSERT INTO public.notifications (
    user_id, 
    type, 
    title, 
    content, 
    data
  ) VALUES (
    NEW.user2_id, 
    'match_created', 
    'New Learning Connection', 
    'You have been matched with ' || COALESCE(user1_name, 'another educator') || '. Go to your dashboard to connect!',
    jsonb_build_object('match_id', NEW.id, 'partner_id', NEW.user1_id, 'partner_name', user1_name)
  );
  
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile with metadata from auth.users
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    onboarding_completed
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email LIKE '%@sideby.ai' -- Auto complete onboarding for admin users
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.handle_notification_request()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  receiver_id UUID;
  match_info RECORD;
BEGIN
  -- Get match information
  SELECT * INTO match_info FROM matches WHERE id = NEW.match_id;
  
  -- Handle based on sender_type rather than sender_id format
  IF NEW.sender_type = 'admin' THEN
    -- If it's an admin message, notify both users
    -- Create notification for user1
    PERFORM create_notification_entry(
      match_info.user1_id, 
      NEW.sender_id, 
      NEW.content, 
      NEW.match_id
    );
    
    -- Create notification for user2
    PERFORM create_notification_entry(
      match_info.user2_id, 
      NEW.sender_id, 
      NEW.content, 
      NEW.match_id
    );
  ELSE
    -- For regular user messages, determine receiver
    IF NEW.sender_id = match_info.user1_id THEN
      receiver_id := match_info.user2_id;
    ELSE
      receiver_id := match_info.user1_id;
    END IF;
    
    -- Create notification for the receiver
    PERFORM create_notification_entry(
      receiver_id, 
      NEW.sender_id, 
      NEW.content, 
      NEW.match_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.handle_profile_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Mark all experiments for this user as deleted when profile is marked as deleted
  IF NEW.status = 'deleted' THEN
    UPDATE public.profile_experiments
    SET 
      status = 'deleted',
      is_deleted = true
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.handle_user_posts_deletion(user_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Update any posts by this user to have a null user_id and deleted status
  UPDATE public.posts 
  SET 
    status = 'deleted',
    user_id = NULL
  WHERE user_id = user_id_param;
  
  -- If we need to handle any other tables that reference posts, we would do it here
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
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

CREATE OR REPLACE FUNCTION public.has_beta_feature(user_uuid uuid, feature_name beta_feature)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM beta_users
    WHERE user_id = user_uuid
    AND feature_name = ANY(features)
  );
$function$
;

CREATE OR REPLACE FUNCTION public.has_community_role(user_id uuid, community_id uuid, role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = $1 
    AND community_id = $2
    AND role = $3
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users
    WHERE id = user_id
  );
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
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

CREATE OR REPLACE FUNCTION public.is_phone_verified(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT COALESCE(phone_verified, FALSE) 
  FROM public.profiles 
  WHERE id = user_id;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.is_post_visible_to_user(post_id uuid, user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  post_status TEXT;
  visibility_settings RECORD;
  user_community_ids UUID[];
BEGIN
  -- Check if post exists and get its status
  SELECT status INTO post_status FROM public.posts WHERE id = post_id;
  
  -- If post is deleted, it's not visible unless the user is an admin
  IF post_status = 'deleted' THEN
    RETURN public.is_sideby_admin_from_profile(user_id);
  END IF;
  
  -- Get the user's communities
  SELECT array_agg(community_id) INTO user_community_ids 
  FROM public.community_members 
  WHERE user_id = user_id;
  
  -- Get visibility settings for this post
  SELECT * INTO visibility_settings 
  FROM public.post_visibility 
  WHERE post_id = post_id 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- If no visibility settings found, post is visible to everyone
  IF visibility_settings IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check visibility type
  CASE visibility_settings.visibility_type
    WHEN 'hidden' THEN
      RETURN public.is_sideby_admin_from_profile(user_id);
    WHEN 'all' THEN
      -- Post visible to all except explicitly hidden users/communities
      RETURN NOT (
        user_id = ANY(visibility_settings.hidden_from_user_ids) OR 
        (visibility_settings.hidden_from_community_ids IS NOT NULL AND 
         visibility_settings.hidden_from_community_ids && user_community_ids)
      );
    WHEN 'specific_users' THEN
      -- Post visible only to specific users
      RETURN user_id = ANY(visibility_settings.visible_to_user_ids);
    WHEN 'specific_communities' THEN
      -- Post visible only to specific communities
      RETURN visibility_settings.visible_to_community_ids && user_community_ids;
    ELSE
      RETURN TRUE; -- Default to visible
  END CASE;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.is_production_environment()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_url TEXT;
BEGIN
  -- Get the current Supabase URL from environment
  SELECT current_setting('app.settings.supabase_url', TRUE) INTO current_url;
  
  -- If the setting isn't available, default to checking the actual URL
  IF current_url IS NULL THEN
    -- Default to true if we can't determine the environment
    -- This is safer than accidentally disabling important functions
    RETURN TRUE;
  END IF;
  
  -- Check if the URL contains 'upffcxqiozqhdgfesmji' (production)
  RETURN current_url LIKE '%upffcxqiozqhdgfesmji%';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_sideby_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
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
  SELECT public.is_current_user_admin() AND auth.uid() = user_id;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
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

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.reject_hat_detection(p_detection_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.hat_detections
  SET status = 'rejected', updated_at = now()
  WHERE id = p_detection_id;
  
  RETURN FOUND;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.remove_user_from_sideby(user_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get the user ID from the profiles table
  SELECT id INTO target_user_id
  FROM profiles
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Remove from match_scheduling_messages where this user is referenced
  DELETE FROM match_scheduling_messages 
  WHERE match_id IN (
    SELECT id FROM matches 
    WHERE user1_id = target_user_id 
    OR user2_id = target_user_id
    OR created_by = target_user_id
  );

  -- Remove from match_admin_messages where this user is referenced
  DELETE FROM match_admin_messages 
  WHERE match_id IN (
    SELECT id FROM matches 
    WHERE user1_id = target_user_id 
    OR user2_id = target_user_id
    OR created_by = target_user_id
  );

  -- Remove all matches where this user is involved
  DELETE FROM matches 
  WHERE user1_id = target_user_id 
  OR user2_id = target_user_id 
  OR created_by = target_user_id;

  -- Remove from all other related tables
  DELETE FROM user_tools WHERE user_id = target_user_id;
  DELETE FROM user_pacing_preferences WHERE user_id = target_user_id;
  DELETE FROM user_roles WHERE user_id = target_user_id;
  DELETE FROM community_members WHERE user_id = target_user_id;
  DELETE FROM profile_experiments WHERE user_id = target_user_id;
  DELETE FROM profiles WHERE id = target_user_id;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.remove_user_from_sideby_improved(user_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  target_user_id UUID;
  match_ids UUID[];
BEGIN
  -- Get the user ID from the profiles table
  SELECT id INTO target_user_id
  FROM profiles
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Get all match IDs where this user is involved
  SELECT array_agg(id) INTO match_ids
  FROM matches 
  WHERE user1_id = target_user_id 
     OR user2_id = target_user_id 
     OR created_by = target_user_id;

  -- Delete records from dependent tables in the correct order
  
  -- First, delete match_meeting_times records
  IF match_ids IS NOT NULL THEN
    DELETE FROM match_meeting_times 
    WHERE match_id = ANY(match_ids);
  END IF;

  -- Then delete match_scheduling_messages
  IF match_ids IS NOT NULL THEN
    DELETE FROM match_scheduling_messages 
    WHERE match_id = ANY(match_ids);
  END IF;

  -- Then delete match_admin_messages
  IF match_ids IS NOT NULL THEN
    DELETE FROM match_admin_messages 
    WHERE match_id = ANY(match_ids);
  END IF;

  -- Delete match_conversation_analysis if it exists
  IF match_ids IS NOT NULL THEN
    DELETE FROM match_conversation_analysis
    WHERE match_id = ANY(match_ids);
  END IF;

  -- Now it's safe to delete the matches
  IF match_ids IS NOT NULL THEN
    DELETE FROM matches 
    WHERE id = ANY(match_ids);
  END IF;

  -- Remove from all other related tables
  DELETE FROM user_tools WHERE user_id = target_user_id;
  DELETE FROM user_pacing_preferences WHERE user_id = target_user_id;
  DELETE FROM user_roles WHERE user_id = target_user_id;
  DELETE FROM community_members WHERE user_id = target_user_id;
  DELETE FROM profile_experiments WHERE user_id = target_user_id;
  DELETE FROM user_availability WHERE user_id = target_user_id;
  DELETE FROM upduo_transcripts WHERE user_id = target_user_id;
  DELETE FROM values_acknowledgment WHERE id = target_user_id;
  
  -- Finally delete the profile
  DELETE FROM profiles WHERE id = target_user_id;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.set_updated_at_for_hat_metadata()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.set_updated_at_for_logs()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.set_updated_at_for_notifications()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.set_updated_at_for_upduo_mappings()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.set_updated_at_trigger_for_visibility()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.sync_user_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.track_journey_stage_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Only track when stage actually changes
  IF OLD.has_completed_reflection IS DISTINCT FROM NEW.has_completed_reflection OR 
     EXISTS (
       -- Check if there's been a change in match status
       SELECT 1 FROM public.matches 
       WHERE (user1_id = NEW.id OR user2_id = NEW.id) 
       AND status = 'active' 
       AND (
         -- New match created since last check
         created_at > (SELECT COALESCE(MAX(created_at), '1970-01-01'::timestamp) 
                     FROM public.user_journey_events 
                     WHERE user_id = NEW.id AND new_stage = 'matched')
         -- OR match status changed
       )
     )
  THEN
    -- Determine previous and new stage
    DECLARE
      previous_stage TEXT;
      current_stage TEXT;
    BEGIN
      -- Get previous stage from latest event
      SELECT COALESCE(
        (SELECT uje.new_stage FROM public.user_journey_events uje
         WHERE uje.user_id = NEW.id 
         ORDER BY uje.created_at DESC 
         LIMIT 1), 
        'new'
      ) INTO previous_stage;
      
      -- Determine new stage based on profile data and matches
      IF NEW.has_completed_reflection = TRUE THEN
        -- Check if user has active matches
        IF EXISTS (
          SELECT 1 FROM public.matches 
          WHERE (user1_id = NEW.id OR user2_id = NEW.id) 
          AND status = 'active'
        ) THEN
          current_stage := 'matched';
          
          -- Check if any meetings are scheduled
          IF EXISTS (
            SELECT 1 FROM public.match_meeting_times mmt
            JOIN public.matches m ON mmt.match_id = m.id
            WHERE (m.user1_id = NEW.id OR m.user2_id = NEW.id)
            AND mmt.status = 'confirmed'
          ) THEN
            current_stage := 'scheduled';
            
            -- Check if they've had conversations
            IF EXISTS (
              SELECT 1 FROM public.upduo_transcripts
              WHERE user_id = NEW.id
              AND metadata->>'type' <> 'SINGLE'
            ) THEN
              current_stage := 'conversation';
              
              -- Check if they've shared ideas
              IF EXISTS (
                SELECT 1 FROM public.saved_items
                WHERE user_id = NEW.id
                AND type = 'idea'
              ) THEN
                current_stage := 'active';
              END IF;
            END IF;
          END IF;
        ELSE
          current_stage := 'reflection_completed';
        END IF;
      ELSE
        current_stage := 'new';
      END IF;
      
      -- Only insert event if stage has actually changed
      IF previous_stage <> current_stage THEN
        INSERT INTO public.user_journey_events (
          user_id, 
          previous_stage, 
          new_stage, 
          metadata
        ) VALUES (
          NEW.id, 
          previous_stage, 
          current_stage, 
          jsonb_build_object(
            'has_completed_reflection', NEW.has_completed_reflection,
            'profile_update_time', now()
          )
        );
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
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

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.trigger_notification_digest()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result json;
  request_id bigint;  -- Changed from text to bigint
  http_response record;
  service_role_key text;
BEGIN
  -- Get the service role key from secrets
  SELECT decrypted_secret INTO service_role_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';

  -- Call the edge function and get request ID, casting result to bigint
  request_id := (SELECT (net.http_post(
    url := 'https://upffcxqiozqhdgfesmji.supabase.co/functions/v1/process-notification-digests',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object('manualTrigger', false, 'source', 'cron')
  ))::bigint);
  
  -- Wait a short time for response to be processed
  PERFORM pg_sleep(0.5);
  
  -- Get response using request_id with explicit bigint comparison
  SELECT status_code, content::json, error_msg INTO http_response
  FROM net._http_response
  WHERE id = request_id;

  -- If we got a response, return it
  IF http_response.status_code IS NOT NULL AND http_response.status_code BETWEEN 200 AND 299 THEN
    RETURN http_response.content;
  ELSE
    -- Return a basic result if no valid response or error
    RETURN json_build_object(
      'success', false, 
      'error', COALESCE(http_response.error_msg, 'No valid response received'),
      'status_code', http_response.status_code
    );
  END IF;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.update_crews_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.use_schema(schema_name text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    EXECUTE format('SET search_path TO %I, public', schema_name);
END;
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

-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.validate_admin_operation()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Only allow if user is authenticated and is admin
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check admin status using profiles table instead of auth.users
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND email LIKE '%@sideby.ai'
  );
END;
$function$
;

CREATE TABLE "public"."admin_alerts" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"match_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text COLLATE "pg_catalog"."default" NOT NULL,
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'pending'::text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE "public"."admin_alerts" ADD CONSTRAINT "admin_alerts_status_check" CHECK((status = ANY (ARRAY['pending'::text, 'resolved'::text, 'dismissed'::text])));

CREATE POLICY "Admin users can manage admin alerts" ON "public"."admin_alerts"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Admins can do anything with alerts" ON "public"."admin_alerts"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING ((auth.email() ~~ '%@sideby.ai'::text))
	WITH CHECK ((auth.email() ~~ '%@sideby.ai'::text));

CREATE POLICY "Users can create alerts" ON "public"."admin_alerts"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((auth.uid() = user_id));

ALTER TABLE "public"."admin_alerts" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY admin_alerts_pkey ON public.admin_alerts USING btree (id);

ALTER TABLE "public"."admin_alerts" ADD CONSTRAINT "admin_alerts_pkey" PRIMARY KEY USING INDEX "admin_alerts_pkey";

CREATE INDEX CONCURRENTLY admin_alerts_match_id_idx ON public.admin_alerts USING btree (match_id);

CREATE INDEX CONCURRENTLY admin_alerts_status_idx ON public.admin_alerts USING btree (status);

CREATE TRIGGER set_timestamp_admin_alerts BEFORE UPDATE ON public.admin_alerts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."admin_users" (
	"id" uuid NOT NULL,
	"role" admin_role NOT NULL DEFAULT 'guide'::admin_role,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE POLICY "Admins can view all admin users" ON "public"."admin_users"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));

ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."admin_users" ADD CONSTRAINT "admin_users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."admin_users" VALIDATE CONSTRAINT "admin_users_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY admin_users_pkey ON public.admin_users USING btree (id);

ALTER TABLE "public"."admin_users" ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY USING INDEX "admin_users_pkey";

CREATE TABLE "public"."beta_user_pending_emails" (
	"email" text COLLATE "pg_catalog"."default" NOT NULL,
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'pending'::text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

CREATE POLICY "admin_manage_pending_emails" ON "public"."beta_user_pending_emails"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING (is_admin(auth.uid()));

ALTER TABLE "public"."beta_user_pending_emails" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY beta_user_pending_emails_pkey ON public.beta_user_pending_emails USING btree (email);

ALTER TABLE "public"."beta_user_pending_emails" ADD CONSTRAINT "beta_user_pending_emails_pkey" PRIMARY KEY USING INDEX "beta_user_pending_emails_pkey";

CREATE TABLE "public"."beta_users" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"features" beta_feature[] DEFAULT ARRAY[]::beta_feature[],
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Only admins can modify beta status" ON "public"."beta_users"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Users can read their own beta status" ON "public"."beta_users"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((auth.uid() = user_id));

CREATE POLICY "admin_manage_beta_users" ON "public"."beta_users"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING (is_admin(auth.uid()));

ALTER TABLE "public"."beta_users" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."beta_users" ADD CONSTRAINT "beta_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."beta_users" VALIDATE CONSTRAINT "beta_users_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY beta_users_pkey ON public.beta_users USING btree (id);

ALTER TABLE "public"."beta_users" ADD CONSTRAINT "beta_users_pkey" PRIMARY KEY USING INDEX "beta_users_pkey";

CREATE TABLE "public"."comments" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text COLLATE "pg_catalog"."default" NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE POLICY "Comments are viewable by everyone" ON "public"."comments"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (true);

CREATE POLICY "Users can create comments" ON "public"."comments"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can delete own comments" ON "public"."comments"
	AS PERMISSIVE
	FOR DELETE
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can update own comments" ON "public"."comments"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING ((auth.uid() = user_id));

ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY comments_pkey ON public.comments USING btree (id);

ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_pkey" PRIMARY KEY USING INDEX "comments_pkey";

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."communities" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"name" text COLLATE "pg_catalog"."default" NOT NULL,
	"description" text COLLATE "pg_catalog"."default",
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE POLICY "Anyone can read communities" ON "public"."communities"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (true);

CREATE POLICY "Authenticated users can view communities" ON "public"."communities"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Communities are viewable by authenticated users" ON "public"."communities"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Communities are viewable by everyone" ON "public"."communities"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING (true);

ALTER TABLE "public"."communities" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY communities_pkey ON public.communities USING btree (id);

ALTER TABLE "public"."communities" ADD CONSTRAINT "communities_pkey" PRIMARY KEY USING INDEX "communities_pkey";

CREATE TABLE "public"."community_feature_flags" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"community_id" uuid NOT NULL,
	"feature_name" text COLLATE "pg_catalog"."default" NOT NULL,
	"description" text COLLATE "pg_catalog"."default",
	"enabled" boolean NOT NULL DEFAULT false,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Admins can manage community feature flags" ON "public"."community_feature_flags"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))));

CREATE POLICY "Community members can read their community's feature flags" ON "public"."community_feature_flags"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((EXISTS ( SELECT 1
   FROM community_members
  WHERE ((community_members.user_id = auth.uid()) AND (community_members.community_id = community_feature_flags.community_id) AND (community_members.status = 'active'::text)))));

ALTER TABLE "public"."community_feature_flags" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."community_feature_flags" ADD CONSTRAINT "community_feature_flags_community_id_fkey" FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."community_feature_flags" VALIDATE CONSTRAINT "community_feature_flags_community_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY community_feature_flags_community_id_feature_name_key ON public.community_feature_flags USING btree (community_id, feature_name);

ALTER TABLE "public"."community_feature_flags" ADD CONSTRAINT "community_feature_flags_community_id_feature_name_key" UNIQUE USING INDEX "community_feature_flags_community_id_feature_name_key";

CREATE UNIQUE INDEX CONCURRENTLY community_feature_flags_pkey ON public.community_feature_flags USING btree (id);

ALTER TABLE "public"."community_feature_flags" ADD CONSTRAINT "community_feature_flags_pkey" PRIMARY KEY USING INDEX "community_feature_flags_pkey";

CREATE TABLE "public"."community_members" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"community_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'active'::text,
	"deleted_at" timestamp with time zone
);

CREATE POLICY "Admins can view all community memberships" ON "public"."community_members"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING (is_current_user_admin());

CREATE POLICY "Users can insert their own community membership" ON "public"."community_members"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can leave communities" ON "public"."community_members"
	AS PERMISSIVE
	FOR DELETE
	TO PUBLIC
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can manage own community membership" ON "public"."community_members"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text))))));

CREATE POLICY "Users can manage their own community memberships" ON "public"."community_members"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own community memberships" ON "public"."community_members"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own memberships" ON "public"."community_members"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((auth.uid() = user_id));

ALTER TABLE "public"."community_members" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."community_members" ADD CONSTRAINT "community_members_community_id_fkey" FOREIGN KEY (community_id) REFERENCES communities(id) NOT VALID;

ALTER TABLE "public"."community_members" VALIDATE CONSTRAINT "community_members_community_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY community_members_community_id_user_id_key ON public.community_members USING btree (community_id, user_id);

ALTER TABLE "public"."community_members" ADD CONSTRAINT "community_members_community_id_user_id_key" UNIQUE USING INDEX "community_members_community_id_user_id_key";

CREATE UNIQUE INDEX CONCURRENTLY community_members_pkey ON public.community_members USING btree (id);

ALTER TABLE "public"."community_members" ADD CONSTRAINT "community_members_pkey" PRIMARY KEY USING INDEX "community_members_pkey";

CREATE TABLE "public"."community_pacing" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"community_id" uuid NOT NULL,
	"light_description" text COLLATE "pg_catalog"."default" DEFAULT 'Monthly engagement with casual participation'::text,
	"moderate_description" text COLLATE "pg_catalog"."default" DEFAULT 'Biweekly participation with regular involvement'::text,
	"consistent_description" text COLLATE "pg_catalog"."default" DEFAULT 'Weekly participation with steady involvement'::text,
	"deep_dive_description" text COLLATE "pg_catalog"."default" DEFAULT 'Thrice weekly participation with high commitment'::text,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE POLICY "Community pacing settings are viewable by everyone" ON "public"."community_pacing"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (true);

ALTER TABLE "public"."community_pacing" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."community_pacing" ADD CONSTRAINT "community_pacing_community_id_fkey" FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."community_pacing" VALIDATE CONSTRAINT "community_pacing_community_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY community_pacing_community_id_key ON public.community_pacing USING btree (community_id);

ALTER TABLE "public"."community_pacing" ADD CONSTRAINT "community_pacing_community_id_key" UNIQUE USING INDEX "community_pacing_community_id_key";

CREATE UNIQUE INDEX CONCURRENTLY community_pacing_pkey ON public.community_pacing USING btree (id);

ALTER TABLE "public"."community_pacing" ADD CONSTRAINT "community_pacing_pkey" PRIMARY KEY USING INDEX "community_pacing_pkey";

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.community_pacing FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."crew_members" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"crew_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"joined_at" timestamp with time zone NOT NULL DEFAULT now(),
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'active'::text,
	"is_lead" boolean NOT NULL DEFAULT false
);

CREATE POLICY "Crew members are viewable by everyone" ON "public"."crew_members"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING (true);

CREATE POLICY "Crew members can be added by admins" ON "public"."crew_members"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK ((auth.email() ~~ '%@sideby.ai'::text));

CREATE POLICY "Crew members can be updated by admins" ON "public"."crew_members"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING ((auth.email() ~~ '%@sideby.ai'::text));

ALTER TABLE "public"."crew_members" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."crew_members" ADD CONSTRAINT "crew_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."crew_members" VALIDATE CONSTRAINT "crew_members_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY crew_members_crew_id_user_id_key ON public.crew_members USING btree (crew_id, user_id);

ALTER TABLE "public"."crew_members" ADD CONSTRAINT "crew_members_crew_id_user_id_key" UNIQUE USING INDEX "crew_members_crew_id_user_id_key";

CREATE UNIQUE INDEX CONCURRENTLY crew_members_pkey ON public.crew_members USING btree (id);

ALTER TABLE "public"."crew_members" ADD CONSTRAINT "crew_members_pkey" PRIMARY KEY USING INDEX "crew_members_pkey";

CREATE TABLE "public"."crews" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"name" text COLLATE "pg_catalog"."default" NOT NULL,
	"code" text COLLATE "pg_catalog"."default" NOT NULL,
	"description" text COLLATE "pg_catalog"."default",
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Crews can be created by sideby admins" ON "public"."crews"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK ((auth.email() ~~ '%@sideby.ai'::text));

CREATE POLICY "Crews can be updated by sideby admins" ON "public"."crews"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING ((auth.email() ~~ '%@sideby.ai'::text));

CREATE POLICY "Public crews are viewable by everyone" ON "public"."crews"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING (true);

ALTER TABLE "public"."crews" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY crews_code_key ON public.crews USING btree (code);

ALTER TABLE "public"."crews" ADD CONSTRAINT "crews_code_key" UNIQUE USING INDEX "crews_code_key";

CREATE UNIQUE INDEX CONCURRENTLY crews_pkey ON public.crews USING btree (id);

ALTER TABLE "public"."crews" ADD CONSTRAINT "crews_pkey" PRIMARY KEY USING INDEX "crews_pkey";

ALTER TABLE "public"."crew_members" ADD CONSTRAINT "crew_members_crew_id_fkey" FOREIGN KEY (crew_id) REFERENCES crews(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."crew_members" VALIDATE CONSTRAINT "crew_members_crew_id_fkey";

CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON public.crews FOR EACH ROW EXECUTE FUNCTION update_crews_updated_at();

CREATE TABLE "public"."email_accounts" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"account_type" email_account_type NOT NULL,
	"from_email" text COLLATE "pg_catalog"."default" NOT NULL,
	"from_name" text COLLATE "pg_catalog"."default" NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

CREATE POLICY "Admin users can manage email accounts" ON "public"."email_accounts"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (is_current_user_admin())
	WITH CHECK (is_current_user_admin());

CREATE UNIQUE INDEX CONCURRENTLY email_accounts_account_type_key ON public.email_accounts USING btree (account_type);

ALTER TABLE "public"."email_accounts" ADD CONSTRAINT "email_accounts_account_type_key" UNIQUE USING INDEX "email_accounts_account_type_key";

CREATE UNIQUE INDEX CONCURRENTLY email_accounts_pkey ON public.email_accounts USING btree (id);

ALTER TABLE "public"."email_accounts" ADD CONSTRAINT "email_accounts_pkey" PRIMARY KEY USING INDEX "email_accounts_pkey";

CREATE TRIGGER audit_email_accounts AFTER INSERT OR DELETE OR UPDATE ON public.email_accounts FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operations();

CREATE TABLE "public"."email_header_footer_templates" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"name" text COLLATE "pg_catalog"."default" NOT NULL,
	"type" text COLLATE "pg_catalog"."default" NOT NULL,
	"html_content" text COLLATE "pg_catalog"."default" NOT NULL,
	"account_type" email_account_type NOT NULL DEFAULT 'robot'::email_account_type,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE "public"."email_header_footer_templates" ADD CONSTRAINT "email_header_footer_templates_type_check" CHECK((type = ANY (ARRAY['header'::text, 'footer'::text])));

CREATE POLICY "Admin users can manage header footer templates" ON "public"."email_header_footer_templates"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (is_current_user_admin())
	WITH CHECK (is_current_user_admin());

CREATE UNIQUE INDEX CONCURRENTLY email_header_footer_templates_pkey ON public.email_header_footer_templates USING btree (id);

ALTER TABLE "public"."email_header_footer_templates" ADD CONSTRAINT "email_header_footer_templates_pkey" PRIMARY KEY USING INDEX "email_header_footer_templates_pkey";

CREATE INDEX CONCURRENTLY idx_email_header_footer_templates_account_type ON public.email_header_footer_templates USING btree (account_type);

CREATE INDEX CONCURRENTLY idx_email_header_footer_templates_is_default ON public.email_header_footer_templates USING btree (is_default);

CREATE INDEX CONCURRENTLY idx_email_header_footer_templates_type ON public.email_header_footer_templates USING btree (type);

CREATE TABLE "public"."email_send_logs" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"template_id" uuid,
	"recipient_email" text COLLATE "pg_catalog"."default" NOT NULL,
	"subject" text COLLATE "pg_catalog"."default" NOT NULL,
	"rendered_html" text COLLATE "pg_catalog"."default",
	"variables_used" jsonb,
	"account_type" email_account_type,
	"status" text COLLATE "pg_catalog"."default" DEFAULT 'pending'::text,
	"error_message" text COLLATE "pg_catalog"."default",
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);

CREATE POLICY "Admin users can manage email logs" ON "public"."email_send_logs"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (is_current_user_admin())
	WITH CHECK (is_current_user_admin());

CREATE UNIQUE INDEX CONCURRENTLY email_send_logs_pkey ON public.email_send_logs USING btree (id);

ALTER TABLE "public"."email_send_logs" ADD CONSTRAINT "email_send_logs_pkey" PRIMARY KEY USING INDEX "email_send_logs_pkey";

CREATE TABLE "public"."email_templates" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"name" text COLLATE "pg_catalog"."default" NOT NULL,
	"subject" text COLLATE "pg_catalog"."default" NOT NULL,
	"template_key" text COLLATE "pg_catalog"."default" NOT NULL,
	"description" text COLLATE "pg_catalog"."default",
	"header_html" text COLLATE "pg_catalog"."default",
	"body_html" text COLLATE "pg_catalog"."default" NOT NULL,
	"footer_html" text COLLATE "pg_catalog"."default",
	"variables" jsonb DEFAULT '[]'::jsonb,
	"account_type" email_account_type DEFAULT 'robot'::email_account_type,
	"status" template_status DEFAULT 'draft'::template_status,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"header_template_id" uuid,
	"footer_template_id" uuid
);

CREATE POLICY "Admin users can manage email templates" ON "public"."email_templates"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (is_current_user_admin())
	WITH CHECK (is_current_user_admin());

ALTER TABLE "public"."email_templates" ADD CONSTRAINT "email_templates_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) NOT VALID;

ALTER TABLE "public"."email_templates" VALIDATE CONSTRAINT "email_templates_created_by_fkey";

ALTER TABLE "public"."email_templates" ADD CONSTRAINT "email_templates_footer_template_id_fkey" FOREIGN KEY (footer_template_id) REFERENCES email_header_footer_templates(id) NOT VALID;

ALTER TABLE "public"."email_templates" VALIDATE CONSTRAINT "email_templates_footer_template_id_fkey";

ALTER TABLE "public"."email_templates" ADD CONSTRAINT "email_templates_header_template_id_fkey" FOREIGN KEY (header_template_id) REFERENCES email_header_footer_templates(id) NOT VALID;

ALTER TABLE "public"."email_templates" VALIDATE CONSTRAINT "email_templates_header_template_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY email_templates_pkey ON public.email_templates USING btree (id);

ALTER TABLE "public"."email_templates" ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY USING INDEX "email_templates_pkey";

CREATE UNIQUE INDEX CONCURRENTLY email_templates_template_key_key ON public.email_templates USING btree (template_key);

ALTER TABLE "public"."email_templates" ADD CONSTRAINT "email_templates_template_key_key" UNIQUE USING INDEX "email_templates_template_key_key";

CREATE INDEX CONCURRENTLY idx_email_templates_footer_template_id ON public.email_templates USING btree (footer_template_id);

CREATE INDEX CONCURRENTLY idx_email_templates_header_template_id ON public.email_templates USING btree (header_template_id);

ALTER TABLE "public"."email_send_logs" ADD CONSTRAINT "email_send_logs_template_id_fkey" FOREIGN KEY (template_id) REFERENCES email_templates(id) NOT VALID;

ALTER TABLE "public"."email_send_logs" VALIDATE CONSTRAINT "email_send_logs_template_id_fkey";

CREATE TRIGGER audit_email_templates AFTER INSERT OR DELETE OR UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operations();

CREATE TABLE "public"."engagement_logs" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"community_id" uuid NOT NULL,
	"engagement_type" text COLLATE "pg_catalog"."default" NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"metadata" jsonb
);

CREATE POLICY "Users can create engagement logs" ON "public"."engagement_logs"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can view their own engagement logs" ON "public"."engagement_logs"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((auth.uid() = user_id));

ALTER TABLE "public"."engagement_logs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."engagement_logs" ADD CONSTRAINT "engagement_logs_community_id_fkey" FOREIGN KEY (community_id) REFERENCES communities(id) NOT VALID;

ALTER TABLE "public"."engagement_logs" VALIDATE CONSTRAINT "engagement_logs_community_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY engagement_logs_pkey ON public.engagement_logs USING btree (id);

ALTER TABLE "public"."engagement_logs" ADD CONSTRAINT "engagement_logs_pkey" PRIMARY KEY USING INDEX "engagement_logs_pkey";

CREATE TABLE "public"."engagement_stats" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid,
	"community_id" uuid,
	"planned_sessions" integer NOT NULL DEFAULT 0,
	"completed_sessions" integer NOT NULL DEFAULT 0,
	"current_streak" integer NOT NULL DEFAULT 0,
	"last_engagement_date" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE POLICY "System can insert engagement stats" ON "public"."engagement_stats"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their own engagement stats" ON "public"."engagement_stats"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own engagement stats" ON "public"."engagement_stats"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((auth.uid() = user_id));

ALTER TABLE "public"."engagement_stats" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."engagement_stats" ADD CONSTRAINT "engagement_stats_community_id_fkey" FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."engagement_stats" VALIDATE CONSTRAINT "engagement_stats_community_id_fkey";

ALTER TABLE "public"."engagement_stats" ADD CONSTRAINT "engagement_stats_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."engagement_stats" VALIDATE CONSTRAINT "engagement_stats_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY engagement_stats_pkey ON public.engagement_stats USING btree (id);

ALTER TABLE "public"."engagement_stats" ADD CONSTRAINT "engagement_stats_pkey" PRIMARY KEY USING INDEX "engagement_stats_pkey";

CREATE UNIQUE INDEX CONCURRENTLY engagement_stats_user_id_community_id_key ON public.engagement_stats USING btree (user_id, community_id);

ALTER TABLE "public"."engagement_stats" ADD CONSTRAINT "engagement_stats_user_id_community_id_key" UNIQUE USING INDEX "engagement_stats_user_id_community_id_key";

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.engagement_stats FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."global_feature_flags" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"feature_name" text COLLATE "pg_catalog"."default" NOT NULL,
	"description" text COLLATE "pg_catalog"."default",
	"enabled" boolean NOT NULL DEFAULT false,
	"active" boolean NOT NULL DEFAULT true,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Admins can manage global feature flags" ON "public"."global_feature_flags"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Everyone can read global feature flags" ON "public"."global_feature_flags"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((active = true));

ALTER TABLE "public"."global_feature_flags" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY global_feature_flags_feature_name_key ON public.global_feature_flags USING btree (feature_name);

ALTER TABLE "public"."global_feature_flags" ADD CONSTRAINT "global_feature_flags_feature_name_key" UNIQUE USING INDEX "global_feature_flags_feature_name_key";

CREATE UNIQUE INDEX CONCURRENTLY global_feature_flags_pkey ON public.global_feature_flags USING btree (id);

ALTER TABLE "public"."global_feature_flags" ADD CONSTRAINT "global_feature_flags_pkey" PRIMARY KEY USING INDEX "global_feature_flags_pkey";

CREATE TABLE "public"."hat_detections" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"hat_name" text COLLATE "pg_catalog"."default" NOT NULL,
	"source" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'session_transcript'::text,
	"confidence" double precision,
	"session_id" text COLLATE "pg_catalog"."default",
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now(),
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'pending'::text,
	"metadata" jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE "public"."hat_detections" ADD CONSTRAINT "valid_status" CHECK((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));

CREATE POLICY "System can insert hat detections" ON "public"."hat_detections"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK (true);

CREATE POLICY "Users can update their own hat detections" ON "public"."hat_detections"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own hat detections" ON "public"."hat_detections"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((auth.uid() = user_id));

ALTER TABLE "public"."hat_detections" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY hat_detections_pkey ON public.hat_detections USING btree (id);

ALTER TABLE "public"."hat_detections" ADD CONSTRAINT "hat_detections_pkey" PRIMARY KEY USING INDEX "hat_detections_pkey";

CREATE INDEX CONCURRENTLY hat_detections_user_id_idx ON public.hat_detections USING btree (user_id);

CREATE TRIGGER set_hat_detections_updated_at BEFORE UPDATE ON public.hat_detections FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."hat_embeddings" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"hat_name" text COLLATE "pg_catalog"."default" NOT NULL,
	"embedding" vector(1536),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);

CREATE POLICY "Admin users can insert hat embeddings" ON "public"."hat_embeddings"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Admin users can update hat embeddings" ON "public"."hat_embeddings"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Admin users can view hat embeddings" ON "public"."hat_embeddings"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

ALTER TABLE "public"."hat_embeddings" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY hat_embeddings_hat_name_key ON public.hat_embeddings USING btree (hat_name);

ALTER TABLE "public"."hat_embeddings" ADD CONSTRAINT "hat_embeddings_hat_name_key" UNIQUE USING INDEX "hat_embeddings_hat_name_key";

CREATE UNIQUE INDEX CONCURRENTLY hat_embeddings_pkey ON public.hat_embeddings USING btree (id);

ALTER TABLE "public"."hat_embeddings" ADD CONSTRAINT "hat_embeddings_pkey" PRIMARY KEY USING INDEX "hat_embeddings_pkey";

CREATE TABLE "public"."hat_inference_requests" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"original_hat" text COLLATE "pg_catalog"."default" NOT NULL,
	"session_id" text COLLATE "pg_catalog"."default",
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'pending'::text,
	"result" text COLLATE "pg_catalog"."default",
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

CREATE UNIQUE INDEX CONCURRENTLY hat_inference_requests_pkey ON public.hat_inference_requests USING btree (id);

ALTER TABLE "public"."hat_inference_requests" ADD CONSTRAINT "hat_inference_requests_pkey" PRIMARY KEY USING INDEX "hat_inference_requests_pkey";

CREATE TRIGGER set_updated_at_hat_inference_requests BEFORE UPDATE ON public.hat_inference_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at_for_hat_metadata();

CREATE TABLE "public"."hat_metadata" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"hat_name" text COLLATE "pg_catalog"."default" NOT NULL,
	"source" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'manual'::text,
	"session_id" text COLLATE "pg_catalog"."default",
	"confidence" double precision,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

CREATE UNIQUE INDEX CONCURRENTLY hat_metadata_pkey ON public.hat_metadata USING btree (id);

ALTER TABLE "public"."hat_metadata" ADD CONSTRAINT "hat_metadata_pkey" PRIMARY KEY USING INDEX "hat_metadata_pkey";

CREATE TRIGGER set_updated_at_hat_metadata BEFORE UPDATE ON public.hat_metadata FOR EACH ROW EXECUTE FUNCTION set_updated_at_for_hat_metadata();

CREATE TABLE "public"."hat_similarity_cache" (
	"hat1" text COLLATE "pg_catalog"."default" NOT NULL,
	"hat2" text COLLATE "pg_catalog"."default" NOT NULL,
	"similarity" double precision NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);

CREATE POLICY "Admin users can insert hat similarities" ON "public"."hat_similarity_cache"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Admin users can update hat similarities" ON "public"."hat_similarity_cache"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Admin users can view hat similarities" ON "public"."hat_similarity_cache"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

ALTER TABLE "public"."hat_similarity_cache" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY hat_similarity_cache_pkey ON public.hat_similarity_cache USING btree (hat1, hat2);

ALTER TABLE "public"."hat_similarity_cache" ADD CONSTRAINT "hat_similarity_cache_pkey" PRIMARY KEY USING INDEX "hat_similarity_cache_pkey";

CREATE TABLE "public"."idea_comments" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"idea_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text COLLATE "pg_catalog"."default" NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE POLICY "Users can create idea comments" ON "public"."idea_comments"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK (((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)));

CREATE POLICY "Users can delete their own idea comments" ON "public"."idea_comments"
	AS PERMISSIVE
	FOR DELETE
	TO PUBLIC
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can update their own idea comments" ON "public"."idea_comments"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can view idea comments" ON "public"."idea_comments"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING (true);

ALTER TABLE "public"."idea_comments" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY idea_comments_pkey ON public.idea_comments USING btree (id);

ALTER TABLE "public"."idea_comments" ADD CONSTRAINT "idea_comments_pkey" PRIMARY KEY USING INDEX "idea_comments_pkey";

CREATE INDEX CONCURRENTLY idx_idea_comments_created_at ON public.idea_comments USING btree (created_at);

CREATE INDEX CONCURRENTLY idx_idea_comments_idea_id ON public.idea_comments USING btree (idea_id);

CREATE INDEX CONCURRENTLY idx_idea_comments_user_id ON public.idea_comments USING btree (user_id);

CREATE TABLE "public"."idea_discussion_messages" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"idea_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text COLLATE "pg_catalog"."default" NOT NULL,
	"sender_type" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'user'::text,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE "public"."idea_discussion_messages" ADD CONSTRAINT "idea_discussion_messages_sender_type_check" CHECK((sender_type = ANY (ARRAY['user'::text, 'admin'::text])));

ALTER TABLE "public"."idea_discussion_messages" REPLICA IDENTITY FULL;

CREATE POLICY "Admins can create messages on any idea" ON "public"."idea_discussion_messages"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))) AND (sender_type = 'admin'::text)));

CREATE POLICY "Admins can view all messages" ON "public"."idea_discussion_messages"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Users can create messages for their own ideas" ON "public"."idea_discussion_messages"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK (((EXISTS ( SELECT 1
   FROM saved_items
  WHERE ((saved_items.id = idea_discussion_messages.idea_id) AND (saved_items.user_id = auth.uid())))) AND (sender_id = auth.uid()) AND (sender_type = 'user'::text)));

CREATE POLICY "Users can view messages for their own ideas" ON "public"."idea_discussion_messages"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((EXISTS ( SELECT 1
   FROM saved_items
  WHERE ((saved_items.id = idea_discussion_messages.idea_id) AND (saved_items.user_id = auth.uid())))));

ALTER TABLE "public"."idea_discussion_messages" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY idea_discussion_messages_pkey ON public.idea_discussion_messages USING btree (id);

ALTER TABLE "public"."idea_discussion_messages" ADD CONSTRAINT "idea_discussion_messages_pkey" PRIMARY KEY USING INDEX "idea_discussion_messages_pkey";

CREATE INDEX CONCURRENTLY idx_idea_discussion_messages_created_at ON public.idea_discussion_messages USING btree (created_at);

CREATE INDEX CONCURRENTLY idx_idea_discussion_messages_idea_id ON public.idea_discussion_messages USING btree (idea_id);

CREATE TABLE "public"."journey_reminder_logs" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"stage" text COLLATE "pg_catalog"."default" NOT NULL,
	"reminder_type" text COLLATE "pg_catalog"."default" NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now(),
	"template_id" uuid,
	"success" boolean DEFAULT true,
	"notification_id" uuid
);

CREATE POLICY "Allow admin full access" ON "public"."journey_reminder_logs"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Allow authenticated read access" ON "public"."journey_reminder_logs"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((auth.role() = 'authenticated'::text));

ALTER TABLE "public"."journey_reminder_logs" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY journey_reminder_logs_pkey ON public.journey_reminder_logs USING btree (id);

ALTER TABLE "public"."journey_reminder_logs" ADD CONSTRAINT "journey_reminder_logs_pkey" PRIMARY KEY USING INDEX "journey_reminder_logs_pkey";

CREATE INDEX CONCURRENTLY journey_reminder_logs_user_stage_idx ON public.journey_reminder_logs USING btree (user_id, stage);

CREATE TABLE "public"."journey_reminder_templates" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"stage" text COLLATE "pg_catalog"."default" NOT NULL,
	"reminder_type" text COLLATE "pg_catalog"."default" NOT NULL,
	"subject" text COLLATE "pg_catalog"."default" NOT NULL,
	"content" text COLLATE "pg_catalog"."default" NOT NULL,
	"cta_text" text COLLATE "pg_catalog"."default",
	"cta_url" text COLLATE "pg_catalog"."default",
	"active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"bypass_template" boolean DEFAULT false,
	"email_template_id" uuid,
	"template_variables" text COLLATE "pg_catalog"."default"
);

CREATE POLICY "Allow admin full access" ON "public"."journey_reminder_templates"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Allow authenticated read access" ON "public"."journey_reminder_templates"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((auth.role() = 'authenticated'::text));

ALTER TABLE "public"."journey_reminder_templates" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."journey_reminder_templates" ADD CONSTRAINT "journey_reminder_templates_email_template_id_fkey" FOREIGN KEY (email_template_id) REFERENCES email_templates(id) NOT VALID;

ALTER TABLE "public"."journey_reminder_templates" VALIDATE CONSTRAINT "journey_reminder_templates_email_template_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY journey_reminder_templates_pkey ON public.journey_reminder_templates USING btree (id);

ALTER TABLE "public"."journey_reminder_templates" ADD CONSTRAINT "journey_reminder_templates_pkey" PRIMARY KEY USING INDEX "journey_reminder_templates_pkey";

CREATE UNIQUE INDEX CONCURRENTLY journey_reminder_templates_stage_type_key ON public.journey_reminder_templates USING btree (stage, reminder_type);

ALTER TABLE "public"."journey_reminder_templates" ADD CONSTRAINT "journey_reminder_templates_stage_type_key" UNIQUE USING INDEX "journey_reminder_templates_stage_type_key";

ALTER TABLE "public"."journey_reminder_logs" ADD CONSTRAINT "journey_reminder_logs_template_id_fkey" FOREIGN KEY (template_id) REFERENCES journey_reminder_templates(id) NOT VALID;

ALTER TABLE "public"."journey_reminder_logs" VALIDATE CONSTRAINT "journey_reminder_logs_template_id_fkey";

CREATE TRIGGER set_timestamp_journey_reminder_templates BEFORE UPDATE ON public.journey_reminder_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."journey_stage_config" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"stage" text COLLATE "pg_catalog"."default" NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now(),
	"label" text COLLATE "pg_catalog"."default",
	"value" text COLLATE "pg_catalog"."default",
	"color" text COLLATE "pg_catalog"."default",
	"display_order" integer DEFAULT 0,
	"deleted_at" timestamp with time zone
);

CREATE POLICY "Allow admin full access" ON "public"."journey_stage_config"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Allow authenticated read access" ON "public"."journey_stage_config"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((auth.role() = 'authenticated'::text));

ALTER TABLE "public"."journey_stage_config" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY journey_stage_config_pkey ON public.journey_stage_config USING btree (id);

ALTER TABLE "public"."journey_stage_config" ADD CONSTRAINT "journey_stage_config_pkey" PRIMARY KEY USING INDEX "journey_stage_config_pkey";

CREATE UNIQUE INDEX CONCURRENTLY journey_stage_config_stage_key ON public.journey_stage_config USING btree (stage);

ALTER TABLE "public"."journey_stage_config" ADD CONSTRAINT "journey_stage_config_stage_key" UNIQUE USING INDEX "journey_stage_config_stage_key";

CREATE UNIQUE INDEX CONCURRENTLY journey_stage_config_value_unique ON public.journey_stage_config USING btree (value);

ALTER TABLE "public"."journey_stage_config" ADD CONSTRAINT "journey_stage_config_value_unique" UNIQUE USING INDEX "journey_stage_config_value_unique";

CREATE INDEX CONCURRENTLY idx_journey_stage_config_order ON public.journey_stage_config USING btree (display_order);

CREATE INDEX CONCURRENTLY idx_journey_stage_config_stage ON public.journey_stage_config USING btree (stage);

CREATE TABLE "public"."match_admin_messages" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"match_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text COLLATE "pg_catalog"."default" NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE "public"."match_admin_messages" REPLICA IDENTITY FULL;

CREATE POLICY "Admins can insert messages" ON "public"."match_admin_messages"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK (is_sideby_admin(auth.uid()));

CREATE POLICY "Admins can read all messages" ON "public"."match_admin_messages"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (is_sideby_admin(auth.uid()));

CREATE POLICY "Admins can update their admin messages" ON "public"."match_admin_messages"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING (((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text ~~ '%@sideby.ai'::text)))) AND (auth.uid() = sender_id)));

ALTER TABLE "public"."match_admin_messages" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY match_admin_messages_pkey ON public.match_admin_messages USING btree (id);

ALTER TABLE "public"."match_admin_messages" ADD CONSTRAINT "match_admin_messages_pkey" PRIMARY KEY USING INDEX "match_admin_messages_pkey";

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.match_admin_messages FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."match_conversation_analysis" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"match_id" uuid NOT NULL,
	"content" text COLLATE "pg_catalog"."default" NOT NULL,
	"analysis_type" match_analysis_type NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Sideby admins can insert match analysis" ON "public"."match_conversation_analysis"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Sideby admins can read match analysis" ON "public"."match_conversation_analysis"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text ~~ '%@sideby.ai'::text)))));

ALTER TABLE "public"."match_conversation_analysis" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY match_conversation_analysis_pkey ON public.match_conversation_analysis USING btree (id);

ALTER TABLE "public"."match_conversation_analysis" ADD CONSTRAINT "match_conversation_analysis_pkey" PRIMARY KEY USING INDEX "match_conversation_analysis_pkey";

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.match_conversation_analysis FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."match_meeting_times" (
	"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
	"match_id" uuid NOT NULL,
	"detected_time" timestamp with time zone NOT NULL,
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'pending'::text,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE "public"."match_meeting_times" ADD CONSTRAINT "match_meeting_times_status_check" CHECK((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'rejected'::text])));

CREATE POLICY "Users can view their own meeting times" ON "public"."match_meeting_times"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((EXISTS ( SELECT 1
   FROM matches m
  WHERE ((m.id = match_meeting_times.match_id) AND ((m.user1_id = auth.uid()) OR (m.user2_id = auth.uid()))))));

ALTER TABLE "public"."match_meeting_times" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY match_meeting_times_match_id_detected_time_key ON public.match_meeting_times USING btree (match_id, detected_time);

ALTER TABLE "public"."match_meeting_times" ADD CONSTRAINT "match_meeting_times_match_id_detected_time_key" UNIQUE USING INDEX "match_meeting_times_match_id_detected_time_key";

CREATE UNIQUE INDEX CONCURRENTLY match_meeting_times_pkey ON public.match_meeting_times USING btree (id);

ALTER TABLE "public"."match_meeting_times" ADD CONSTRAINT "match_meeting_times_pkey" PRIMARY KEY USING INDEX "match_meeting_times_pkey";

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.match_meeting_times FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."match_pools" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"name" text COLLATE "pg_catalog"."default" NOT NULL,
	"description" text COLLATE "pg_catalog"."default",
	"user_emails" text[] COLLATE "pg_catalog"."default" NOT NULL DEFAULT '{}'::text[],
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now(),
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'active'::text
);

ALTER TABLE "public"."match_pools" ADD CONSTRAINT "match_pools_status_check" CHECK((status = ANY (ARRAY['active'::text, 'archived'::text, 'processing'::text])));

CREATE POLICY "Admins can manage match pools" ON "public"."match_pools"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (is_admin_user());

ALTER TABLE "public"."match_pools" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY match_pools_pkey ON public.match_pools USING btree (id);

ALTER TABLE "public"."match_pools" ADD CONSTRAINT "match_pools_pkey" PRIMARY KEY USING INDEX "match_pools_pkey";

CREATE INDEX CONCURRENTLY idx_match_pools_created_by ON public.match_pools USING btree (created_by);

CREATE INDEX CONCURRENTLY idx_match_pools_status ON public.match_pools USING btree (status);

CREATE TABLE "public"."match_scheduling_messages" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"match_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text COLLATE "pg_catalog"."default" NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"sender_type" text COLLATE "pg_catalog"."default" DEFAULT 'user'::text,
	"timezone" text COLLATE "pg_catalog"."default"
);

ALTER TABLE "public"."match_scheduling_messages" REPLICA IDENTITY FULL;

CREATE POLICY "Allow admins to view all scheduling messages" ON "public"."match_scheduling_messages"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));

CREATE POLICY "Allow sideby admins full access to messages" ON "public"."match_scheduling_messages"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING (is_sideby_admin(auth.uid()));

CREATE POLICY "Allow users to insert messages for their matches" ON "public"."match_scheduling_messages"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((auth.uid() IN ( SELECT matches.user1_id
   FROM matches
  WHERE (matches.id = match_scheduling_messages.match_id)
UNION
 SELECT matches.user2_id
   FROM matches
  WHERE (matches.id = match_scheduling_messages.match_id))));

CREATE POLICY "Allow users to read their own match messages" ON "public"."match_scheduling_messages"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((auth.uid() IN ( SELECT matches.user1_id
   FROM matches
  WHERE (matches.id = match_scheduling_messages.match_id)
UNION
 SELECT matches.user2_id
   FROM matches
  WHERE (matches.id = match_scheduling_messages.match_id))));

CREATE POLICY "Users can insert messages for their matches" ON "public"."match_scheduling_messages"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK ((EXISTS ( SELECT 1
   FROM matches
  WHERE ((matches.id = match_scheduling_messages.match_id) AND ((matches.user1_id = auth.uid()) OR (matches.user2_id = auth.uid()))))));

CREATE POLICY "Users can read messages for their matches" ON "public"."match_scheduling_messages"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((EXISTS ( SELECT 1
   FROM matches
  WHERE ((matches.id = match_scheduling_messages.match_id) AND ((matches.user1_id = auth.uid()) OR (matches.user2_id = auth.uid()))))));

CREATE POLICY "Users can send match messages" ON "public"."match_scheduling_messages"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK (((auth.uid() = sender_id) AND (auth.uid() IN ( SELECT matches.user1_id
   FROM matches
  WHERE (matches.id = match_scheduling_messages.match_id)
UNION
 SELECT matches.user2_id
   FROM matches
  WHERE (matches.id = match_scheduling_messages.match_id)))));

CREATE POLICY "Users can send messages to their matches" ON "public"."match_scheduling_messages"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK (((EXISTS ( SELECT 1
   FROM matches
  WHERE ((matches.id = match_scheduling_messages.match_id) AND ((matches.user1_id = auth.uid()) OR (matches.user2_id = auth.uid())) AND (matches.status = 'active'::text)))) AND (sender_id = auth.uid())));

CREATE POLICY "Users can update their own scheduling messages" ON "public"."match_scheduling_messages"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING ((auth.uid() = sender_id));

CREATE POLICY "Users can view messages from their matches" ON "public"."match_scheduling_messages"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((EXISTS ( SELECT 1
   FROM matches
  WHERE ((matches.id = match_scheduling_messages.match_id) AND ((matches.user1_id = auth.uid()) OR (matches.user2_id = auth.uid()))))));

CREATE POLICY "Users can view their match messages" ON "public"."match_scheduling_messages"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((auth.uid() IN ( SELECT matches.user1_id
   FROM matches
  WHERE (matches.id = match_scheduling_messages.match_id)
UNION
 SELECT matches.user2_id
   FROM matches
  WHERE (matches.id = match_scheduling_messages.match_id))));

ALTER TABLE "public"."match_scheduling_messages" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY match_scheduling_messages_pkey ON public.match_scheduling_messages USING btree (id);

ALTER TABLE "public"."match_scheduling_messages" ADD CONSTRAINT "match_scheduling_messages_pkey" PRIMARY KEY USING INDEX "match_scheduling_messages_pkey";

CREATE TRIGGER handle_admin_message_before_insert BEFORE INSERT ON public.match_scheduling_messages FOR EACH ROW EXECUTE FUNCTION handle_admin_message();

CREATE TRIGGER on_new_message_notification AFTER INSERT ON public.match_scheduling_messages FOR EACH ROW EXECUTE FUNCTION handle_notification_request();

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.match_scheduling_messages FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."match_suggestions" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"pool_id" uuid NOT NULL,
	"user1_email" text COLLATE "pg_catalog"."default" NOT NULL,
	"user2_email" text COLLATE "pg_catalog"."default" NOT NULL,
	"user1_id" uuid,
	"user2_id" uuid,
	"match_reason" text COLLATE "pg_catalog"."default" NOT NULL,
	"confidence_score" double precision DEFAULT 0.8,
	"transcript_analysis" jsonb,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'pending'::text
);

ALTER TABLE "public"."match_suggestions" ADD CONSTRAINT "match_suggestions_status_check" CHECK((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'matched'::text])));

CREATE POLICY "Admins can create match suggestions" ON "public"."match_suggestions"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK (is_admin_user());

CREATE POLICY "Admins can update match suggestions" ON "public"."match_suggestions"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING (is_admin_user());

CREATE POLICY "Admins can view match suggestions" ON "public"."match_suggestions"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING (is_admin_user());

ALTER TABLE "public"."match_suggestions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."match_suggestions" ADD CONSTRAINT "match_suggestions_pool_id_fkey" FOREIGN KEY (pool_id) REFERENCES match_pools(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."match_suggestions" VALIDATE CONSTRAINT "match_suggestions_pool_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY match_suggestions_pkey ON public.match_suggestions USING btree (id);

ALTER TABLE "public"."match_suggestions" ADD CONSTRAINT "match_suggestions_pkey" PRIMARY KEY USING INDEX "match_suggestions_pkey";

CREATE INDEX CONCURRENTLY idx_match_suggestions_pool_id ON public.match_suggestions USING btree (pool_id);

CREATE INDEX CONCURRENTLY idx_match_suggestions_status ON public.match_suggestions USING btree (status);

CREATE INDEX CONCURRENTLY idx_match_suggestions_user_emails ON public.match_suggestions USING btree (user1_email, user2_email);

CREATE TABLE "public"."match_user_notes" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"match_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text COLLATE "pg_catalog"."default" NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Users can create their own match notes" ON "public"."match_user_notes"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can delete their own match notes" ON "public"."match_user_notes"
	AS PERMISSIVE
	FOR DELETE
	TO PUBLIC
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can update their own match notes" ON "public"."match_user_notes"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own match notes" ON "public"."match_user_notes"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((auth.uid() = user_id));

ALTER TABLE "public"."match_user_notes" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY match_user_notes_pkey ON public.match_user_notes USING btree (id);

ALTER TABLE "public"."match_user_notes" ADD CONSTRAINT "match_user_notes_pkey" PRIMARY KEY USING INDEX "match_user_notes_pkey";

CREATE UNIQUE INDEX CONCURRENTLY unique_user_match_note ON public.match_user_notes USING btree (match_id, user_id);

ALTER TABLE "public"."match_user_notes" ADD CONSTRAINT "unique_user_match_note" UNIQUE USING INDEX "unique_user_match_note";

CREATE INDEX CONCURRENTLY idx_match_user_notes_match_user ON public.match_user_notes USING btree (match_id, user_id);

CREATE TABLE "public"."matches" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user1_id" uuid NOT NULL,
	"user2_id" uuid NOT NULL,
	"rationale" text COLLATE "pg_catalog"."default" NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"created_by" uuid NOT NULL,
	"email_sent_at" timestamp with time zone,
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'active'::text,
	"completion_notes" text COLLATE "pg_catalog"."default",
	"completed_at" timestamp with time zone,
	"completed_by" uuid,
	"upduo_session_id" text COLLATE "pg_catalog"."default",
	"upduo_session_name" text COLLATE "pg_catalog"."default"
);

ALTER TABLE "public"."matches" ADD CONSTRAINT "different_users" CHECK((user1_id <> user2_id));

ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_status_check" CHECK((status = ANY (ARRAY['active'::text, 'completed'::text, 'cancelled'::text])));

ALTER TABLE "public"."matches" REPLICA IDENTITY FULL;

CREATE POLICY "Admins can create matches" ON "public"."matches"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))));

CREATE POLICY "Admins can delete matches" ON "public"."matches"
	AS PERMISSIVE
	FOR DELETE
	TO authenticated
	USING (is_sideby_admin(auth.uid()));

CREATE POLICY "Admins can insert matches" ON "public"."matches"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK (is_sideby_admin(auth.uid()));

CREATE POLICY "Admins can manage all matches" ON "public"."matches"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING (is_current_user_admin());

CREATE POLICY "Admins can select all matches" ON "public"."matches"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (is_sideby_admin(auth.uid()));

CREATE POLICY "Admins can update match completion" ON "public"."matches"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING (can_complete_matches(auth.uid()))
	WITH CHECK (can_complete_matches(auth.uid()));

CREATE POLICY "Admins can update matches" ON "public"."matches"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING ((auth.uid() IN ( SELECT users.id
   FROM auth.users
  WHERE ((users.email)::text ~~ '%@sideby.ai'::text))))
	WITH CHECK ((auth.uid() IN ( SELECT users.id
   FROM auth.users
  WHERE ((users.email)::text ~~ '%@sideby.ai'::text))));

CREATE POLICY "Admins can view all matches" ON "public"."matches"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING (is_sideby_admin(auth.uid()));

CREATE POLICY "Allow admins to insert matches" ON "public"."matches"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));

CREATE POLICY "Allow admins to read matches" ON "public"."matches"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));

CREATE POLICY "Allow admins to update matches" ON "public"."matches"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text))
	WITH CHECK (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));

CREATE POLICY "Allow admins to view all matches" ON "public"."matches"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));

CREATE POLICY "Allow admins to view matches" ON "public"."matches"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));

CREATE POLICY "Allow reading matches" ON "public"."matches"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (((auth.uid() = user1_id) OR (auth.uid() = user2_id) OR can_complete_matches(auth.uid())));

CREATE POLICY "Allow sideby.ai users to complete matches" ON "public"."matches"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING (can_complete_matches(auth.uid()))
	WITH CHECK (can_complete_matches(auth.uid()));

CREATE POLICY "Users can view their own matches" ON "public"."matches"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (((auth.uid() = user1_id) OR (auth.uid() = user2_id)));

CREATE POLICY "View matches" ON "public"."matches"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))) OR (auth.uid() = user1_id) OR (auth.uid() = user2_id)));

ALTER TABLE "public"."matches" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_completed_by_fkey" FOREIGN KEY (completed_by) REFERENCES auth.users(id) NOT VALID;

ALTER TABLE "public"."matches" VALIDATE CONSTRAINT "matches_completed_by_fkey";

CREATE UNIQUE INDEX CONCURRENTLY matches_pkey ON public.matches USING btree (id);

ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_pkey" PRIMARY KEY USING INDEX "matches_pkey";

CREATE UNIQUE INDEX CONCURRENTLY unique_active_match ON public.matches USING btree (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id)) WHERE (status = 'active'::text);

ALTER TABLE "public"."admin_alerts" ADD CONSTRAINT "admin_alerts_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."admin_alerts" VALIDATE CONSTRAINT "admin_alerts_match_id_fkey";

ALTER TABLE "public"."match_admin_messages" ADD CONSTRAINT "match_admin_messages_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."match_admin_messages" VALIDATE CONSTRAINT "match_admin_messages_match_id_fkey";

ALTER TABLE "public"."match_conversation_analysis" ADD CONSTRAINT "match_conversation_analysis_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) NOT VALID;

ALTER TABLE "public"."match_conversation_analysis" VALIDATE CONSTRAINT "match_conversation_analysis_match_id_fkey";

ALTER TABLE "public"."match_meeting_times" ADD CONSTRAINT "match_meeting_times_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) NOT VALID;

ALTER TABLE "public"."match_meeting_times" VALIDATE CONSTRAINT "match_meeting_times_match_id_fkey";

ALTER TABLE "public"."match_scheduling_messages" ADD CONSTRAINT "match_scheduling_messages_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."match_scheduling_messages" VALIDATE CONSTRAINT "match_scheduling_messages_match_id_fkey";

ALTER TABLE "public"."match_user_notes" ADD CONSTRAINT "match_user_notes_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."match_user_notes" VALIDATE CONSTRAINT "match_user_notes_match_id_fkey";

CREATE TRIGGER audit_matches AFTER INSERT OR DELETE OR UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operations();

CREATE TRIGGER enforce_match_limit_trigger BEFORE INSERT ON public.matches FOR EACH ROW EXECUTE FUNCTION enforce_match_limit();

CREATE TRIGGER handle_match_email AFTER INSERT ON public.matches FOR EACH ROW EXECUTE FUNCTION handle_match_email();

CREATE TABLE "public"."notification_delivery_logs" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"notification_id" uuid NOT NULL,
	"channel" text COLLATE "pg_catalog"."default" NOT NULL,
	"success" boolean NOT NULL DEFAULT false,
	"attempt_count" integer NOT NULL DEFAULT 1,
	"last_attempt_at" timestamp with time zone NOT NULL DEFAULT now(),
	"error" text COLLATE "pg_catalog"."default",
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"source_table" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'notifications'::text,
	"updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE "public"."notification_delivery_logs" ADD CONSTRAINT "notification_delivery_logs_channel_check" CHECK((channel = ANY (ARRAY['email'::text, 'sms'::text, 'in_app'::text, 'cron_trigger'::text, 'edge_function'::text])));

CREATE POLICY "Admins can insert notification logs" ON "public"."notification_delivery_logs"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK (is_sideby_admin(auth.uid()));

CREATE POLICY "Admins can view all notification logs" ON "public"."notification_delivery_logs"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING (is_sideby_admin(auth.uid()));

CREATE POLICY "Service role can insert notification logs" ON "public"."notification_delivery_logs"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK ((auth.role() = 'service_role'::text));

CREATE POLICY "Service role can update notification logs" ON "public"."notification_delivery_logs"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING ((auth.role() = 'service_role'::text));

CREATE POLICY "Users can view their own notification delivery logs" ON "public"."notification_delivery_logs"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((EXISTS ( SELECT 1
   FROM notifications n
  WHERE ((n.id = notification_delivery_logs.notification_id) AND (n.user_id = auth.uid())))));

CREATE POLICY "Users can view their own notification logs" ON "public"."notification_delivery_logs"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((((source_table = 'notifications'::text) AND (EXISTS ( SELECT 1
   FROM notifications n
  WHERE ((n.id = notification_delivery_logs.notification_id) AND (n.user_id = auth.uid()))))) OR ((source_table = 'pending_notifications'::text) AND (EXISTS ( SELECT 1
   FROM pending_notifications pn
  WHERE ((pn.id = notification_delivery_logs.notification_id) AND (pn.user_id = auth.uid()))))) OR ((source_table = 'system'::text) AND (notification_id = '00000000-0000-0000-0000-000000000000'::uuid))));

ALTER TABLE "public"."notification_delivery_logs" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY notification_delivery_logs_pkey ON public.notification_delivery_logs USING btree (id);

ALTER TABLE "public"."notification_delivery_logs" ADD CONSTRAINT "notification_delivery_logs_pkey" PRIMARY KEY USING INDEX "notification_delivery_logs_pkey";

CREATE INDEX CONCURRENTLY idx_notification_delivery_logs_channel ON public.notification_delivery_logs USING btree (channel);

CREATE INDEX CONCURRENTLY idx_notification_delivery_logs_notification_id ON public.notification_delivery_logs USING btree (notification_id);

CREATE INDEX CONCURRENTLY idx_notification_delivery_logs_source_table ON public.notification_delivery_logs USING btree (source_table);

CREATE TRIGGER set_updated_at_trigger BEFORE UPDATE ON public.notification_delivery_logs FOR EACH ROW EXECUTE FUNCTION set_updated_at_for_logs();

CREATE TABLE "public"."notifications" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"type" text COLLATE "pg_catalog"."default" NOT NULL,
	"title" text COLLATE "pg_catalog"."default" NOT NULL,
	"content" text COLLATE "pg_catalog"."default" NOT NULL,
	"data" jsonb,
	"read" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"priority" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'normal'::text,
	"channels" jsonb DEFAULT '{"sms": false, "email": false, "in_app": true}'::jsonb,
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'delivered'::text,
	"deduplication_key" text COLLATE "pg_catalog"."default",
	"processed_at" timestamp with time zone,
	"error" text COLLATE "pg_catalog"."default"
);

ALTER TABLE "public"."notifications" REPLICA IDENTITY FULL;

CREATE POLICY "Admins can manage all notifications" ON "public"."notifications"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING (is_current_user_admin());

CREATE POLICY "Anyone can insert notifications" ON "public"."notifications"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK (true);

CREATE POLICY "Service role can manage all notifications" ON "public"."notifications"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

CREATE POLICY "Users can update their own notifications" ON "public"."notifications"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own notifications" ON "public"."notifications"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "notifications_insert_own" ON "public"."notifications"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "notifications_select_own" ON "public"."notifications"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((user_id = auth.uid()));

CREATE POLICY "notifications_update_own" ON "public"."notifications"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING ((user_id = auth.uid()));

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY notifications_pkey ON public.notifications USING btree (id);

ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_pkey" PRIMARY KEY USING INDEX "notifications_pkey";

CREATE INDEX CONCURRENTLY idx_notifications_deduplication ON public.notifications USING btree (user_id, deduplication_key) WHERE (deduplication_key IS NOT NULL);

CREATE INDEX CONCURRENTLY idx_notifications_user_status ON public.notifications USING btree (user_id, read, created_at DESC);

CREATE INDEX CONCURRENTLY notifications_read_idx ON public.notifications USING btree (read);

CREATE INDEX CONCURRENTLY notifications_user_id_idx ON public.notifications USING btree (user_id);

ALTER TABLE "public"."notification_delivery_logs" ADD CONSTRAINT "notification_delivery_logs_notification_id_fkey" FOREIGN KEY (notification_id) REFERENCES notifications(id) NOT VALID;

ALTER TABLE "public"."notification_delivery_logs" VALIDATE CONSTRAINT "notification_delivery_logs_notification_id_fkey";

CREATE TRIGGER set_updated_at_for_notifications BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION set_updated_at_for_notifications();

CREATE TABLE "public"."pending_match_announcements" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"match_id" uuid NOT NULL,
	"user1_id" uuid NOT NULL,
	"user2_id" uuid NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'pending'::text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

CREATE POLICY "Admin users can manage match announcements" ON "public"."pending_match_announcements"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (is_sideby_admin(auth.uid()))
	WITH CHECK (is_sideby_admin(auth.uid()));

ALTER TABLE "public"."pending_match_announcements" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."pending_match_announcements" ADD CONSTRAINT "pending_match_announcements_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."pending_match_announcements" VALIDATE CONSTRAINT "pending_match_announcements_match_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY pending_match_announcements_pkey ON public.pending_match_announcements USING btree (id);

ALTER TABLE "public"."pending_match_announcements" ADD CONSTRAINT "pending_match_announcements_pkey" PRIMARY KEY USING INDEX "pending_match_announcements_pkey";

CREATE INDEX CONCURRENTLY idx_pending_announcements_scheduled ON public.pending_match_announcements USING btree (scheduled_for);

CREATE INDEX CONCURRENTLY idx_pending_announcements_status ON public.pending_match_announcements USING btree (status);

CREATE TABLE "public"."pending_notifications" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"notification_type" text COLLATE "pg_catalog"."default" NOT NULL,
	"channel" text COLLATE "pg_catalog"."default" NOT NULL,
	"title" text COLLATE "pg_catalog"."default" NOT NULL,
	"content" text COLLATE "pg_catalog"."default" NOT NULL,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"processed_at" timestamp with time zone,
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'pending'::text
);

CREATE POLICY "Allow admins to manage notifications" ON "public"."pending_notifications"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (is_sideby_admin(auth.uid()));

ALTER TABLE "public"."pending_notifications" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."pending_notifications" ADD CONSTRAINT "pending_notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) NOT VALID;

ALTER TABLE "public"."pending_notifications" VALIDATE CONSTRAINT "pending_notifications_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY pending_notifications_pkey ON public.pending_notifications USING btree (id);

ALTER TABLE "public"."pending_notifications" ADD CONSTRAINT "pending_notifications_pkey" PRIMARY KEY USING INDEX "pending_notifications_pkey";

CREATE INDEX CONCURRENTLY idx_pending_notifications_status_channel ON public.pending_notifications USING btree (status, channel);

CREATE INDEX CONCURRENTLY idx_pending_notifications_user_id ON public.pending_notifications USING btree (user_id);

CREATE TABLE "public"."post_visibility" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"post_id" uuid NOT NULL,
	"visibility_type" text COLLATE "pg_catalog"."default" NOT NULL,
	"visible_to_user_ids" uuid[],
	"visible_to_community_ids" uuid[],
	"hidden_from_user_ids" uuid[],
	"hidden_from_community_ids" uuid[],
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now(),
	"created_by" uuid NOT NULL
);

ALTER TABLE "public"."post_visibility" ADD CONSTRAINT "post_visibility_visibility_type_check" CHECK((visibility_type = ANY (ARRAY['all'::text, 'specific_users'::text, 'specific_communities'::text, 'hidden'::text])));

CREATE POLICY "Admins can manage post visibility" ON "public"."post_visibility"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (is_sideby_admin(auth.uid()))
	WITH CHECK (is_sideby_admin(auth.uid()));

CREATE POLICY "Anyone can view post visibility" ON "public"."post_visibility"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (true);

ALTER TABLE "public"."post_visibility" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."post_visibility" ADD CONSTRAINT "post_visibility_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) NOT VALID;

ALTER TABLE "public"."post_visibility" VALIDATE CONSTRAINT "post_visibility_created_by_fkey";

CREATE UNIQUE INDEX CONCURRENTLY post_visibility_pkey ON public.post_visibility USING btree (id);

ALTER TABLE "public"."post_visibility" ADD CONSTRAINT "post_visibility_pkey" PRIMARY KEY USING INDEX "post_visibility_pkey";

CREATE TRIGGER set_timestamp_post_visibility BEFORE UPDATE ON public.post_visibility FOR EACH ROW EXECUTE FUNCTION set_updated_at_trigger_for_visibility();

CREATE TABLE "public"."posts" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid,
	"content" text COLLATE "pg_catalog"."default" NOT NULL,
	"type" text COLLATE "pg_catalog"."default" NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"experiment_id" uuid,
	"metadata" jsonb,
	"image_url" text COLLATE "pg_catalog"."default",
	"generated_idea" text COLLATE "pg_catalog"."default",
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'active'::text,
	"match_id" uuid
);

ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_status_check" CHECK((status = ANY (ARRAY['active'::text, 'deleted'::text])));

ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_type_check" CHECK((type = ANY (ARRAY['text'::text, 'resource'::text, 'lesson'::text, 'ai_trick'::text, 'upduo_reflection'::text, 'experiment_stance'::text])));

CREATE POLICY "Allow users to delete their own posts" ON "public"."posts"
	AS PERMISSIVE
	FOR DELETE
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "Allow users to insert their own posts" ON "public"."posts"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Allow users to see all posts" ON "public"."posts"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (true);

CREATE POLICY "Allow users to update their own posts" ON "public"."posts"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "Posts are viewable by everyone" ON "public"."posts"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (true);

CREATE POLICY "Users can create posts" ON "public"."posts"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can insert own posts" ON "public"."posts"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Users can update own posts" ON "public"."posts"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING ((auth.uid() = user_id))
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can view posts from community members" ON "public"."posts"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (((EXISTS ( SELECT 1
   FROM (community_members cm1
     JOIN community_members cm2 ON ((cm1.community_id = cm2.community_id)))
  WHERE ((cm1.user_id = auth.uid()) AND (cm2.user_id = posts.user_id)))) OR (user_id = auth.uid())));

CREATE POLICY "admins can insert posts for users" ON "public"."posts"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((is_sideby_admin(auth.uid()) OR (auth.uid() = user_id)));

CREATE POLICY "users can view their own posts and posts they're mentioned in" ON "public"."posts"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (((auth.uid() = user_id) OR is_sideby_admin(auth.uid())));

ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."posts" ADD CONSTRAINT "fk_posts_match_id" FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL NOT VALID;

ALTER TABLE "public"."posts" VALIDATE CONSTRAINT "fk_posts_match_id";

CREATE UNIQUE INDEX CONCURRENTLY posts_pkey ON public.posts USING btree (id);

ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_pkey" PRIMARY KEY USING INDEX "posts_pkey";

CREATE INDEX CONCURRENTLY idx_posts_match_id ON public.posts USING btree (match_id);

ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."comments" VALIDATE CONSTRAINT "comments_post_id_fkey";

ALTER TABLE "public"."post_visibility" ADD CONSTRAINT "post_visibility_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."post_visibility" VALIDATE CONSTRAINT "post_visibility_post_id_fkey";

CREATE TABLE "public"."process_gaps" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"description" text COLLATE "pg_catalog"."default" NOT NULL,
	"status" gap_status DEFAULT 'open'::gap_status,
	"created_by" uuid NOT NULL,
	"closed_by" uuid,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"closed_at" timestamp with time zone
);

CREATE POLICY "Admins can insert process gaps" ON "public"."process_gaps"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));

CREATE POLICY "Admins can update process gaps" ON "public"."process_gaps"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));

CREATE POLICY "Admins can view all process gaps" ON "public"."process_gaps"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));

ALTER TABLE "public"."process_gaps" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY process_gaps_pkey ON public.process_gaps USING btree (id);

ALTER TABLE "public"."process_gaps" ADD CONSTRAINT "process_gaps_pkey" PRIMARY KEY USING INDEX "process_gaps_pkey";

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.process_gaps FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."profile_experiments" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"suggested_hats" text[] COLLATE "pg_catalog"."default" DEFAULT ARRAY[]::text[],
	"stance_statement" text COLLATE "pg_catalog"."default",
	"primary_flow_activity" text COLLATE "pg_catalog"."default",
	"learning_focus" text[] COLLATE "pg_catalog"."default",
	"teaching_focus" text[] COLLATE "pg_catalog"."default",
	"analyzed_transcript" text COLLATE "pg_catalog"."default",
	"source_type" text COLLATE "pg_catalog"."default" NOT NULL,
	"confidence_score" double precision,
	"is_second_opinion" boolean DEFAULT false,
	"experiment_type" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'stance_from_welcome'::text,
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'active'::text,
	"excitement_areas" text[] COLLATE "pg_catalog"."default",
	"caution_areas" text[] COLLATE "pg_catalog"."default",
	"moment_of_brilliance" text COLLATE "pg_catalog"."default",
	"is_deleted" boolean NOT NULL DEFAULT false,
	"created_by" uuid
);

ALTER TABLE "public"."profile_experiments" ADD CONSTRAINT "valid_experiment_types" CHECK((experiment_type = ANY (ARRAY['stance_from_welcome'::text, 'guts_vs_fear'::text])));

CREATE POLICY "Admin users can manage all experiments" ON "public"."profile_experiments"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (is_sideby_admin(auth.uid()))
	WITH CHECK (is_sideby_admin(auth.uid()));

CREATE POLICY "Allow admin users full access" ON "public"."profile_experiments"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text))
	WITH CHECK (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));

CREATE POLICY "Users can view their own experiments" ON "public"."profile_experiments"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((user_id = auth.uid()));

ALTER TABLE "public"."profile_experiments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profile_experiments" ADD CONSTRAINT "profile_experiments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) NOT VALID;

ALTER TABLE "public"."profile_experiments" VALIDATE CONSTRAINT "profile_experiments_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY profile_experiments_pkey ON public.profile_experiments USING btree (id);

ALTER TABLE "public"."profile_experiments" ADD CONSTRAINT "profile_experiments_pkey" PRIMARY KEY USING INDEX "profile_experiments_pkey";

CREATE INDEX CONCURRENTLY profile_experiments_type_idx ON public.profile_experiments USING btree (experiment_type);

ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_experiment_id_fkey" FOREIGN KEY (experiment_id) REFERENCES profile_experiments(id) NOT VALID;

ALTER TABLE "public"."posts" VALIDATE CONSTRAINT "posts_experiment_id_fkey";

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.profile_experiments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."profiles" (
	"id" uuid NOT NULL,
	"first_name" text COLLATE "pg_catalog"."default",
	"last_name" text COLLATE "pg_catalog"."default",
	"bio" text COLLATE "pg_catalog"."default",
	"teaching_experience" text COLLATE "pg_catalog"."default",
	"subjects" text[] COLLATE "pg_catalog"."default",
	"certifications" text[] COLLATE "pg_catalog"."default",
	"avatar_url" text COLLATE "pg_catalog"."default",
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"subject_statuses" jsonb[] DEFAULT ARRAY[]::jsonb[],
	"email" text COLLATE "pg_catalog"."default" NOT NULL,
	"email_preferences" jsonb DEFAULT '{"chat_notifications": true}'::jsonb,
	"approved_stance" text COLLATE "pg_catalog"."default",
	"impersonating_user_id" uuid,
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'active'::text,
	"deleted_at" timestamp with time zone,
	"onboarding_completed" boolean NOT NULL DEFAULT false,
	"phone_number" text COLLATE "pg_catalog"."default",
	"notification_preferences" jsonb DEFAULT '{"sms": false, "email": true, "in_app": true}'::jsonb,
	"phone_verified" boolean DEFAULT false,
	"phone_verification_code" text COLLATE "pg_catalog"."default",
	"phone_verification_sent_at" timestamp with time zone,
	"approved_flow_activity" text COLLATE "pg_catalog"."default",
	"has_completed_reflection" boolean DEFAULT false,
	"primary_flow_activity" text COLLATE "pg_catalog"."default",
	"metadata" jsonb,
	"journey_stage" text COLLATE "pg_catalog"."default" DEFAULT 'new'::text,
	"reflection_quality_score" integer DEFAULT 0,
	"has_partial_reflection" boolean DEFAULT false,
	"location" text COLLATE "pg_catalog"."default"
);

CREATE POLICY "Admin users can insert profiles" ON "public"."profiles"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK (is_current_user_admin());

CREATE POLICY "Admin users can update all profiles" ON "public"."profiles"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING (is_current_user_admin());

CREATE POLICY "Admin users can view all profiles" ON "public"."profiles"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING (is_current_user_admin());

CREATE POLICY "Users can insert own profile" ON "public"."profiles"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK ((auth.uid() = id));

CREATE POLICY "Users can update own profile" ON "public"."profiles"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING ((auth.uid() = id));

CREATE POLICY "Users can view match partner profiles" ON "public"."profiles"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((EXISTS ( SELECT 1
   FROM matches m
  WHERE (((m.user1_id = auth.uid()) AND (m.user2_id = profiles.id)) OR ((m.user2_id = auth.uid()) AND (m.user1_id = profiles.id))))));

CREATE POLICY "Users can view own profile" ON "public"."profiles"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((auth.uid() = id));

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."profiles" VALIDATE CONSTRAINT "profiles_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY profiles_pkey ON public.profiles USING btree (id);

ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_pkey" PRIMARY KEY USING INDEX "profiles_pkey";

CREATE INDEX CONCURRENTLY idx_profiles_reflection_quality ON public.profiles USING btree (reflection_quality_score, has_completed_reflection);

CREATE UNIQUE INDEX CONCURRENTLY profiles_email_unique_idx ON public.profiles USING btree (email);

ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."comments" VALIDATE CONSTRAINT "comments_user_id_fkey";

ALTER TABLE "public"."community_members" ADD CONSTRAINT "community_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."community_members" VALIDATE CONSTRAINT "community_members_user_id_fkey";

ALTER TABLE "public"."crew_members" ADD CONSTRAINT "fk_crew_members_user_id" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."crew_members" VALIDATE CONSTRAINT "fk_crew_members_user_id";

ALTER TABLE "public"."engagement_logs" ADD CONSTRAINT "engagement_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."engagement_logs" VALIDATE CONSTRAINT "engagement_logs_user_id_fkey";

ALTER TABLE "public"."hat_detections" ADD CONSTRAINT "hat_detections_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."hat_detections" VALIDATE CONSTRAINT "hat_detections_user_id_fkey";

ALTER TABLE "public"."hat_inference_requests" ADD CONSTRAINT "hat_inference_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."hat_inference_requests" VALIDATE CONSTRAINT "hat_inference_requests_user_id_fkey";

ALTER TABLE "public"."hat_metadata" ADD CONSTRAINT "hat_metadata_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."hat_metadata" VALIDATE CONSTRAINT "hat_metadata_user_id_fkey";

ALTER TABLE "public"."idea_discussion_messages" ADD CONSTRAINT "fk_idea_discussion_messages_sender" FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."idea_discussion_messages" VALIDATE CONSTRAINT "fk_idea_discussion_messages_sender";

ALTER TABLE "public"."journey_reminder_logs" ADD CONSTRAINT "journey_reminder_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."journey_reminder_logs" VALIDATE CONSTRAINT "journey_reminder_logs_user_id_fkey";

ALTER TABLE "public"."match_scheduling_messages" ADD CONSTRAINT "match_scheduling_messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."match_scheduling_messages" VALIDATE CONSTRAINT "match_scheduling_messages_sender_id_fkey";

ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."matches" VALIDATE CONSTRAINT "matches_created_by_fkey";

ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_user1_id_fkey" FOREIGN KEY (user1_id) REFERENCES profiles(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."matches" VALIDATE CONSTRAINT "matches_user1_id_fkey";

ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_user2_id_fkey" FOREIGN KEY (user2_id) REFERENCES profiles(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."matches" VALIDATE CONSTRAINT "matches_user2_id_fkey";

ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."notifications" VALIDATE CONSTRAINT "notifications_user_id_fkey";

ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."posts" VALIDATE CONSTRAINT "posts_user_id_fkey";

ALTER TABLE "public"."process_gaps" ADD CONSTRAINT "process_gaps_closed_by_fkey" FOREIGN KEY (closed_by) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."process_gaps" VALIDATE CONSTRAINT "process_gaps_closed_by_fkey";

ALTER TABLE "public"."process_gaps" ADD CONSTRAINT "process_gaps_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."process_gaps" VALIDATE CONSTRAINT "process_gaps_created_by_fkey";

ALTER TABLE "public"."profile_experiments" ADD CONSTRAINT "profile_experiments_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."profile_experiments" VALIDATE CONSTRAINT "profile_experiments_created_by_fkey";

ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_impersonating_user_id_fkey" FOREIGN KEY (impersonating_user_id) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."profiles" VALIDATE CONSTRAINT "profiles_impersonating_user_id_fkey";

CREATE TRIGGER audit_profiles AFTER DELETE OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operations();

CREATE TRIGGER auto_enroll_beta_users_trigger AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION auto_enroll_beta_users();

CREATE TRIGGER profile_deletion_trigger AFTER UPDATE OF status ON public.profiles FOR EACH ROW WHEN ((new.status = 'deleted'::text)) EXECUTE FUNCTION handle_profile_deletion();

CREATE TRIGGER profile_journey_stage_tracking AFTER UPDATE OF has_completed_reflection ON public.profiles FOR EACH ROW EXECUTE FUNCTION track_journey_stage_change();

CREATE TRIGGER track_journey_stage_changes AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION track_journey_stage_change();

CREATE TRIGGER trigger_journey_stage_change AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION notify_journey_stage_change();

CREATE TABLE "public"."saved_items" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"original_post_id" uuid,
	"content" text COLLATE "pg_catalog"."default" NOT NULL,
	"type" saved_item_type NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now(),
	"excitement_level" smallint,
	"alignment_level" smallint
);

ALTER TABLE "public"."saved_items" REPLICA IDENTITY FULL;

CREATE POLICY "Admins can view all saved items" ON "public"."saved_items"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING (((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.email ~~ '%@sideby.ai'::text))) OR (auth.uid() = user_id)));

CREATE POLICY "Users can delete their own saved items" ON "public"."saved_items"
	AS PERMISSIVE
	FOR DELETE
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can insert their own saved items" ON "public"."saved_items"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text))))));

CREATE POLICY "Users can save items" ON "public"."saved_items"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can save microtranslations" ON "public"."saved_items"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((type = 'microtranslation'::saved_item_type));

CREATE POLICY "Users can update their own saved items" ON "public"."saved_items"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own saved items" ON "public"."saved_items"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text))))));

ALTER TABLE "public"."saved_items" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."saved_items" ADD CONSTRAINT "saved_items_original_post_id_fkey" FOREIGN KEY (original_post_id) REFERENCES posts(id) NOT VALID;

ALTER TABLE "public"."saved_items" VALIDATE CONSTRAINT "saved_items_original_post_id_fkey";

ALTER TABLE "public"."saved_items" ADD CONSTRAINT "saved_items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."saved_items" VALIDATE CONSTRAINT "saved_items_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY saved_items_pkey ON public.saved_items USING btree (id);

ALTER TABLE "public"."saved_items" ADD CONSTRAINT "saved_items_pkey" PRIMARY KEY USING INDEX "saved_items_pkey";

ALTER TABLE "public"."idea_comments" ADD CONSTRAINT "idea_comments_idea_id_fkey" FOREIGN KEY (idea_id) REFERENCES saved_items(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."idea_comments" VALIDATE CONSTRAINT "idea_comments_idea_id_fkey";

ALTER TABLE "public"."idea_discussion_messages" ADD CONSTRAINT "idea_discussion_messages_idea_id_fkey" FOREIGN KEY (idea_id) REFERENCES saved_items(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."idea_discussion_messages" VALIDATE CONSTRAINT "idea_discussion_messages_idea_id_fkey";

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.saved_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.saved_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."security_audit_logs" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid,
	"operation" text COLLATE "pg_catalog"."default" NOT NULL,
	"table_name" text COLLATE "pg_catalog"."default",
	"record_id" uuid,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" inet,
	"user_agent" text COLLATE "pg_catalog"."default",
	"created_at" timestamp with time zone DEFAULT now()
);

CREATE POLICY "Admin access to audit logs" ON "public"."security_audit_logs"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text ~~ '%@sideby.ai'::text)))));

ALTER TABLE "public"."security_audit_logs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."security_audit_logs" ADD CONSTRAINT "security_audit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) NOT VALID;

ALTER TABLE "public"."security_audit_logs" VALIDATE CONSTRAINT "security_audit_logs_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY security_audit_logs_pkey ON public.security_audit_logs USING btree (id);

ALTER TABLE "public"."security_audit_logs" ADD CONSTRAINT "security_audit_logs_pkey" PRIMARY KEY USING INDEX "security_audit_logs_pkey";

CREATE TABLE "public"."sponsorships" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"tool_name" text COLLATE "pg_catalog"."default" NOT NULL,
	"store" text COLLATE "pg_catalog"."default" NOT NULL,
	"district" text COLLATE "pg_catalog"."default" NOT NULL,
	"region" text COLLATE "pg_catalog"."default" NOT NULL,
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'pending'::text,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE POLICY "Users can create sponsorship claims" ON "public"."sponsorships"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can view their own sponsorships" ON "public"."sponsorships"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((auth.uid() = user_id));

ALTER TABLE "public"."sponsorships" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."sponsorships" ADD CONSTRAINT "sponsorships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."sponsorships" VALIDATE CONSTRAINT "sponsorships_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY sponsorships_pkey ON public.sponsorships USING btree (id);

ALTER TABLE "public"."sponsorships" ADD CONSTRAINT "sponsorships_pkey" PRIMARY KEY USING INDEX "sponsorships_pkey";

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.sponsorships FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."tools" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"name" text COLLATE "pg_catalog"."default" NOT NULL,
	"type" tool_type NOT NULL,
	"description" text COLLATE "pg_catalog"."default",
	"url" text COLLATE "pg_catalog"."default" NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"price_per_month" numeric(10,2),
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'active'::text
);

CREATE POLICY "Admins can manage tools" ON "public"."tools"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text))
	WITH CHECK (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));

CREATE POLICY "Tools are viewable by authenticated users" ON "public"."tools"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (true);

ALTER TABLE "public"."tools" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY tools_pkey ON public.tools USING btree (id);

ALTER TABLE "public"."tools" ADD CONSTRAINT "tools_pkey" PRIMARY KEY USING INDEX "tools_pkey";

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.tools FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."upduo_session_schedules" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"pacing_level" pacing_level NOT NULL,
	"frequency" text COLLATE "pg_catalog"."default" NOT NULL,
	"description" text COLLATE "pg_catalog"."default" NOT NULL
);

CREATE POLICY "Upduo schedules are viewable by everyone" ON "public"."upduo_session_schedules"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING (true);

ALTER TABLE "public"."upduo_session_schedules" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY upduo_session_schedules_pkey ON public.upduo_session_schedules USING btree (id);

ALTER TABLE "public"."upduo_session_schedules" ADD CONSTRAINT "upduo_session_schedules_pkey" PRIMARY KEY USING INDEX "upduo_session_schedules_pkey";

CREATE TABLE "public"."upduo_transcripts" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"conversation_id" text COLLATE "pg_catalog"."default" NOT NULL,
	"transcript" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now(),
	"metadata" jsonb,
	"session_duration" integer DEFAULT 0,
	"word_count" integer DEFAULT 0,
	"quality_score" integer DEFAULT 0
);

CREATE POLICY "Users can insert their own transcripts" ON "public"."upduo_transcripts"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can manage their own transcripts" ON "public"."upduo_transcripts"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can read their own transcripts" ON "public"."upduo_transcripts"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((user_id = auth.uid()));

CREATE POLICY "Users can view their own transcripts" ON "public"."upduo_transcripts"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((auth.uid() = user_id));

ALTER TABLE "public"."upduo_transcripts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."upduo_transcripts" ADD CONSTRAINT "upduo_transcripts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."upduo_transcripts" VALIDATE CONSTRAINT "upduo_transcripts_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY upduo_transcripts_conversation_id_key ON public.upduo_transcripts USING btree (conversation_id);

ALTER TABLE "public"."upduo_transcripts" ADD CONSTRAINT "upduo_transcripts_conversation_id_key" UNIQUE USING INDEX "upduo_transcripts_conversation_id_key";

CREATE UNIQUE INDEX CONCURRENTLY upduo_transcripts_pkey ON public.upduo_transcripts USING btree (id);

ALTER TABLE "public"."upduo_transcripts" ADD CONSTRAINT "upduo_transcripts_pkey" PRIMARY KEY USING INDEX "upduo_transcripts_pkey";

CREATE INDEX CONCURRENTLY idx_upduo_transcripts_created_at ON public.upduo_transcripts USING btree (created_at);

CREATE INDEX CONCURRENTLY idx_upduo_transcripts_quality ON public.upduo_transcripts USING btree (quality_score, session_duration);

CREATE INDEX CONCURRENTLY idx_upduo_transcripts_user_id ON public.upduo_transcripts USING btree (user_id);

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.upduo_transcripts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."upduo_user_associations" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"upduo_user_id" text COLLATE "pg_catalog"."default" NOT NULL,
	"sideby_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE POLICY "Admins can manage all upduo user associations" ON "public"."upduo_user_associations"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (is_sideby_admin(auth.uid()))
	WITH CHECK (is_sideby_admin(auth.uid()));

ALTER TABLE "public"."upduo_user_associations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."upduo_user_associations" ADD CONSTRAINT "upduo_user_associations_sideby_user_id_fkey" FOREIGN KEY (sideby_user_id) REFERENCES profiles(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."upduo_user_associations" VALIDATE CONSTRAINT "upduo_user_associations_sideby_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY upduo_user_associations_pkey ON public.upduo_user_associations USING btree (id);

ALTER TABLE "public"."upduo_user_associations" ADD CONSTRAINT "upduo_user_associations_pkey" PRIMARY KEY USING INDEX "upduo_user_associations_pkey";

CREATE UNIQUE INDEX CONCURRENTLY upduo_user_associations_upduo_user_id_key ON public.upduo_user_associations USING btree (upduo_user_id);

ALTER TABLE "public"."upduo_user_associations" ADD CONSTRAINT "upduo_user_associations_upduo_user_id_key" UNIQUE USING INDEX "upduo_user_associations_upduo_user_id_key";

CREATE INDEX CONCURRENTLY idx_upduo_user_associations_sideby_user_id ON public.upduo_user_associations USING btree (sideby_user_id);

CREATE INDEX CONCURRENTLY idx_upduo_user_associations_upduo_user_id ON public.upduo_user_associations USING btree (upduo_user_id);

CREATE TRIGGER set_timestamp_upduo_user_associations BEFORE UPDATE ON public.upduo_user_associations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."upduo_user_mappings" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"upduo_user_id" text COLLATE "pg_catalog"."default" NOT NULL,
	"sideby_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Allow insert for authenticated users" ON "public"."upduo_user_mappings"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK (true);

CREATE POLICY "Allow select for authenticated users" ON "public"."upduo_user_mappings"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (true);

ALTER TABLE "public"."upduo_user_mappings" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX CONCURRENTLY upduo_user_mappings_pkey ON public.upduo_user_mappings USING btree (id);

ALTER TABLE "public"."upduo_user_mappings" ADD CONSTRAINT "upduo_user_mappings_pkey" PRIMARY KEY USING INDEX "upduo_user_mappings_pkey";

CREATE UNIQUE INDEX CONCURRENTLY upduo_user_mappings_upduo_user_id_key ON public.upduo_user_mappings USING btree (upduo_user_id);

ALTER TABLE "public"."upduo_user_mappings" ADD CONSTRAINT "upduo_user_mappings_upduo_user_id_key" UNIQUE USING INDEX "upduo_user_mappings_upduo_user_id_key";

CREATE INDEX CONCURRENTLY idx_upduo_user_mappings_sideby_user_id ON public.upduo_user_mappings USING btree (sideby_user_id);

CREATE INDEX CONCURRENTLY idx_upduo_user_mappings_upduo_user_id ON public.upduo_user_mappings USING btree (upduo_user_id);

CREATE TRIGGER set_updated_at_trigger_for_upduo_mappings BEFORE UPDATE ON public.upduo_user_mappings FOR EACH ROW EXECUTE FUNCTION set_updated_at_for_upduo_mappings();

CREATE TABLE "public"."user_availability" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"time_slots" jsonb NOT NULL DEFAULT '[]'::jsonb,
	"pacing_level" text COLLATE "pg_catalog"."default",
	"updated_at" timestamp with time zone NOT NULL DEFAULT now(),
	"created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Admins can view all user availability" ON "public"."user_availability"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Users can insert their own availability" ON "public"."user_availability"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their own availability" ON "public"."user_availability"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own availability" ON "public"."user_availability"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((auth.uid() = user_id));

ALTER TABLE "public"."user_availability" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_availability" ADD CONSTRAINT "user_availability_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."user_availability" VALIDATE CONSTRAINT "user_availability_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY user_availability_pkey ON public.user_availability USING btree (id);

ALTER TABLE "public"."user_availability" ADD CONSTRAINT "user_availability_pkey" PRIMARY KEY USING INDEX "user_availability_pkey";

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.user_availability FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."user_custom_tools" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"name" text COLLATE "pg_catalog"."default" NOT NULL,
	"url" text COLLATE "pg_catalog"."default" NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now(),
	"type" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'custom'::text,
	"description" text COLLATE "pg_catalog"."default"
);

ALTER TABLE "public"."user_custom_tools" ADD CONSTRAINT "user_custom_tools_type_check" CHECK((type = ANY (ARRAY['predefined'::text, 'custom'::text])));

CREATE POLICY "Users can create their own custom tools" ON "public"."user_custom_tools"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can delete their own custom tools" ON "public"."user_custom_tools"
	AS PERMISSIVE
	FOR DELETE
	TO PUBLIC
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can update their own custom tools" ON "public"."user_custom_tools"
	AS PERMISSIVE
	FOR UPDATE
	TO PUBLIC
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own custom tools" ON "public"."user_custom_tools"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((auth.uid() = user_id));

ALTER TABLE "public"."user_custom_tools" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_custom_tools" ADD CONSTRAINT "user_custom_tools_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) NOT VALID;

ALTER TABLE "public"."user_custom_tools" VALIDATE CONSTRAINT "user_custom_tools_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY user_custom_tools_pkey ON public.user_custom_tools USING btree (id);

ALTER TABLE "public"."user_custom_tools" ADD CONSTRAINT "user_custom_tools_pkey" PRIMARY KEY USING INDEX "user_custom_tools_pkey";

CREATE INDEX CONCURRENTLY idx_user_custom_tools_user_type ON public.user_custom_tools USING btree (user_id, type);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_custom_tools FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."user_flow_activities" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"session_id" text COLLATE "pg_catalog"."default" NOT NULL,
	"flow_activity" text COLLATE "pg_catalog"."default",
	"confidence" double precision,
	"created_at" timestamp with time zone DEFAULT now()
);

CREATE POLICY "Admins have full access to flow activities" ON "public"."user_flow_activities"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));

CREATE POLICY "Users can view their own flow activities" ON "public"."user_flow_activities"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((auth.uid() = user_id));

ALTER TABLE "public"."user_flow_activities" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_flow_activities" ADD CONSTRAINT "user_flow_activities_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."user_flow_activities" VALIDATE CONSTRAINT "user_flow_activities_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY user_flow_activities_pkey ON public.user_flow_activities USING btree (id);

ALTER TABLE "public"."user_flow_activities" ADD CONSTRAINT "user_flow_activities_pkey" PRIMARY KEY USING INDEX "user_flow_activities_pkey";

CREATE UNIQUE INDEX CONCURRENTLY user_flow_activities_user_id_session_id_key ON public.user_flow_activities USING btree (user_id, session_id);

ALTER TABLE "public"."user_flow_activities" ADD CONSTRAINT "user_flow_activities_user_id_session_id_key" UNIQUE USING INDEX "user_flow_activities_user_id_session_id_key";

CREATE TABLE "public"."user_journey_events" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"previous_stage" text COLLATE "pg_catalog"."default",
	"new_stage" text COLLATE "pg_catalog"."default" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'::jsonb
);

CREATE POLICY "Admin users can view all journey events" ON "public"."user_journey_events"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING (is_admin_user());

CREATE POLICY "System can insert journey events" ON "public"."user_journey_events"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK (true);

ALTER TABLE "public"."user_journey_events" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_journey_events" ADD CONSTRAINT "user_journey_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."user_journey_events" VALIDATE CONSTRAINT "user_journey_events_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY user_journey_events_pkey ON public.user_journey_events USING btree (id);

ALTER TABLE "public"."user_journey_events" ADD CONSTRAINT "user_journey_events_pkey" PRIMARY KEY USING INDEX "user_journey_events_pkey";

CREATE INDEX CONCURRENTLY user_journey_events_stage_date_idx ON public.user_journey_events USING btree (new_stage, created_at);

CREATE INDEX CONCURRENTLY user_journey_events_user_id_idx ON public.user_journey_events USING btree (user_id);

CREATE TABLE "public"."user_pacing_preferences" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"community_id" uuid NOT NULL,
	"pacing_level" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'moderate'::pacing_level,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"session_time" session_time DEFAULT '12PM'::session_time,
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'active'::text,
	"deleted_at" timestamp with time zone
);

CREATE POLICY "Admins can insert pacing preferences for any user" ON "public"."user_pacing_preferences"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Admins can read all pacing preferences" ON "public"."user_pacing_preferences"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Admins can view all pacing preferences" ON "public"."user_pacing_preferences"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING (is_current_user_admin());

CREATE POLICY "Users can create their own pacing preferences" ON "public"."user_pacing_preferences"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can delete own pacing preferences" ON "public"."user_pacing_preferences"
	AS PERMISSIVE
	FOR DELETE
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can insert their own pacing preferences" ON "public"."user_pacing_preferences"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can manage own pacing preferences" ON "public"."user_pacing_preferences"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text))))));

CREATE POLICY "Users can manage their own pacing preferences" ON "public"."user_pacing_preferences"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can read own pacing preferences" ON "public"."user_pacing_preferences"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can update their own pacing preferences" ON "public"."user_pacing_preferences"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own pacing preferences" ON "public"."user_pacing_preferences"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((auth.uid() = user_id));

ALTER TABLE "public"."user_pacing_preferences" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_pacing_preferences" ADD CONSTRAINT "user_pacing_preferences_community_id_fkey" FOREIGN KEY (community_id) REFERENCES communities(id) NOT VALID;

ALTER TABLE "public"."user_pacing_preferences" VALIDATE CONSTRAINT "user_pacing_preferences_community_id_fkey";

ALTER TABLE "public"."user_pacing_preferences" ADD CONSTRAINT "user_pacing_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."user_pacing_preferences" VALIDATE CONSTRAINT "user_pacing_preferences_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY user_pacing_preferences_pkey ON public.user_pacing_preferences USING btree (id);

ALTER TABLE "public"."user_pacing_preferences" ADD CONSTRAINT "user_pacing_preferences_pkey" PRIMARY KEY USING INDEX "user_pacing_preferences_pkey";

CREATE UNIQUE INDEX CONCURRENTLY user_pacing_preferences_user_id_community_id_key ON public.user_pacing_preferences USING btree (user_id, community_id);

ALTER TABLE "public"."user_pacing_preferences" ADD CONSTRAINT "user_pacing_preferences_user_id_community_id_key" UNIQUE USING INDEX "user_pacing_preferences_user_id_community_id_key";

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_pacing_preferences FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."user_roles" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"community_id" uuid NOT NULL,
	"role" app_role NOT NULL DEFAULT 'member'::app_role,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'active'::text,
	"deleted_at" timestamp with time zone
);

CREATE POLICY "Community managers can insert roles" ON "public"."user_roles"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK (has_community_role(auth.uid(), community_id, 'community_manager'::app_role));

CREATE POLICY "Community managers can update roles" ON "public"."user_roles"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING (has_community_role(auth.uid(), community_id, 'community_manager'::app_role));

CREATE POLICY "Users can view roles in their communities" ON "public"."user_roles"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((EXISTS ( SELECT 1
   FROM community_members cm
  WHERE ((cm.community_id = user_roles.community_id) AND (cm.user_id = auth.uid())))));

ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_community_id_fkey" FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."user_roles" VALIDATE CONSTRAINT "user_roles_community_id_fkey";

ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."user_roles" VALIDATE CONSTRAINT "user_roles_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY user_roles_pkey ON public.user_roles USING btree (id);

ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY USING INDEX "user_roles_pkey";

CREATE UNIQUE INDEX CONCURRENTLY user_roles_user_id_community_id_key ON public.user_roles USING btree (user_id, community_id);

ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_community_id_key" UNIQUE USING INDEX "user_roles_user_id_community_id_key";

CREATE TABLE "public"."user_session_schedules" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"frequency" session_frequency NOT NULL,
	"start_week" date NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE POLICY "Users can create their own schedules" ON "public"."user_session_schedules"
	AS PERMISSIVE
	FOR INSERT
	TO authenticated
	WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their own schedules" ON "public"."user_session_schedules"
	AS PERMISSIVE
	FOR UPDATE
	TO authenticated
	USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own schedules" ON "public"."user_session_schedules"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING ((auth.uid() = user_id));

ALTER TABLE "public"."user_session_schedules" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_session_schedules" ADD CONSTRAINT "user_session_schedules_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) NOT VALID;

ALTER TABLE "public"."user_session_schedules" VALIDATE CONSTRAINT "user_session_schedules_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY user_session_schedules_pkey ON public.user_session_schedules USING btree (id);

ALTER TABLE "public"."user_session_schedules" ADD CONSTRAINT "user_session_schedules_pkey" PRIMARY KEY USING INDEX "user_session_schedules_pkey";

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.user_session_schedules FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."user_tools" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"tool_id" uuid NOT NULL,
	"assigned_by" uuid NOT NULL,
	"assigned_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"expires_at" timestamp with time zone NOT NULL,
	"status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'active'::text,
	"created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE POLICY "Admins can manage tool assignments" ON "public"."user_tools"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text))
	WITH CHECK (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));

CREATE POLICY "Users can view their assigned tools" ON "public"."user_tools"
	AS PERMISSIVE
	FOR SELECT
	TO authenticated
	USING (((auth.uid() = user_id) OR ((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text)));

ALTER TABLE "public"."user_tools" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_tools" ADD CONSTRAINT "user_tools_assigned_by_fkey" FOREIGN KEY (assigned_by) REFERENCES auth.users(id) NOT VALID;

ALTER TABLE "public"."user_tools" VALIDATE CONSTRAINT "user_tools_assigned_by_fkey";

ALTER TABLE "public"."user_tools" ADD CONSTRAINT "user_tools_tool_id_fkey" FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."user_tools" VALIDATE CONSTRAINT "user_tools_tool_id_fkey";

ALTER TABLE "public"."user_tools" ADD CONSTRAINT "user_tools_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."user_tools" VALIDATE CONSTRAINT "user_tools_user_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY user_tools_pkey ON public.user_tools USING btree (id);

ALTER TABLE "public"."user_tools" ADD CONSTRAINT "user_tools_pkey" PRIMARY KEY USING INDEX "user_tools_pkey";

CREATE UNIQUE INDEX CONCURRENTLY user_tools_user_id_tool_id_key ON public.user_tools USING btree (user_id, tool_id);

ALTER TABLE "public"."user_tools" ADD CONSTRAINT "user_tools_user_id_tool_id_key" UNIQUE USING INDEX "user_tools_user_id_tool_id_key";

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.user_tools FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE "public"."values_acknowledgment" (
	"id" uuid NOT NULL,
	"acknowledged_at" timestamp with time zone DEFAULT now()
);

CREATE POLICY "Admins can view all values acknowledgments" ON "public"."values_acknowledgment"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text ~~ '%@sideby.ai'::text)))));

CREATE POLICY "Enable insert access for users on own values acknowledgment" ON "public"."values_acknowledgment"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK ((id = get_current_user_id()));

CREATE POLICY "Enable read access for users on own values acknowledgment" ON "public"."values_acknowledgment"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((id = get_current_user_id()));

CREATE POLICY "Users can insert their own acknowledgment" ON "public"."values_acknowledgment"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK (((auth.uid() = id) OR is_current_user_admin()));

CREATE POLICY "Users can insert their own values acknowledgment" ON "public"."values_acknowledgment"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK (((id = get_current_user_id()) OR is_current_user_admin()));

CREATE POLICY "Users can manage own values acknowledgment" ON "public"."values_acknowledgment"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING (((auth.uid() = id) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text))))));

CREATE POLICY "Users can manage their own values acknowledgment" ON "public"."values_acknowledgment"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING ((auth.uid() = id));

CREATE POLICY "Users can only view and insert their own acknowledgment" ON "public"."values_acknowledgment"
	AS PERMISSIVE
	FOR ALL
	TO PUBLIC
	USING ((auth.uid() = id))
	WITH CHECK ((auth.uid() = id));

CREATE POLICY "Users can view their own acknowledgment" ON "public"."values_acknowledgment"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING (((auth.uid() = id) OR is_current_user_admin()));

CREATE POLICY "Users can view their own values acknowledgment" ON "public"."values_acknowledgment"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING (((id = get_current_user_id()) OR is_current_user_admin()));

CREATE POLICY "values_acknowledgment_insert_own" ON "public"."values_acknowledgment"
	AS PERMISSIVE
	FOR INSERT
	TO PUBLIC
	WITH CHECK ((id = auth.uid()));

CREATE POLICY "values_acknowledgment_select_own" ON "public"."values_acknowledgment"
	AS PERMISSIVE
	FOR SELECT
	TO PUBLIC
	USING ((id = auth.uid()));

ALTER TABLE "public"."values_acknowledgment" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."values_acknowledgment" ADD CONSTRAINT "values_acknowledgment_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."values_acknowledgment" VALIDATE CONSTRAINT "values_acknowledgment_id_fkey";

CREATE UNIQUE INDEX CONCURRENTLY values_acknowledgment_user_unique ON public.values_acknowledgment USING btree (id);

ALTER TABLE "public"."values_acknowledgment" ADD CONSTRAINT "values_acknowledgment_user_unique" PRIMARY KEY USING INDEX "values_acknowledgment_user_unique";

