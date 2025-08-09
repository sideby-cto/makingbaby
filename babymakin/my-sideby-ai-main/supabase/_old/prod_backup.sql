

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "testing";


ALTER SCHEMA "testing" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgmq" WITH SCHEMA "pgmq";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";






CREATE TYPE "public"."admin_role" AS ENUM (
    'guide',
    'admin'
);


ALTER TYPE "public"."admin_role" OWNER TO "postgres";


CREATE TYPE "public"."app_role" AS ENUM (
    'community_manager',
    'member'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."beta_feature" AS ENUM (
    'video_intro',
    'transcription',
    'newUserFlowBeta'
);


ALTER TYPE "public"."beta_feature" OWNER TO "postgres";


CREATE TYPE "public"."feature_flag_type" AS ENUM (
    'new_dashboard',
    'experimental_tools',
    'advanced_analytics',
    'beta_features'
);


ALTER TYPE "public"."feature_flag_type" OWNER TO "postgres";


CREATE TYPE "public"."gap_status" AS ENUM (
    'open',
    'closed'
);


ALTER TYPE "public"."gap_status" OWNER TO "postgres";


CREATE TYPE "public"."match_analysis_type" AS ENUM (
    'stance',
    'learning',
    'touchpoint',
    'disagreement'
);


ALTER TYPE "public"."match_analysis_type" OWNER TO "postgres";


CREATE TYPE "public"."pacing_level" AS ENUM (
    'light',
    'moderate',
    'consistent',
    'deep_dive'
);


ALTER TYPE "public"."pacing_level" OWNER TO "postgres";


CREATE TYPE "public"."saved_item_type" AS ENUM (
    'microtranslation',
    'idea',
    'resource'
);


ALTER TYPE "public"."saved_item_type" OWNER TO "postgres";


CREATE TYPE "public"."session_frequency" AS ENUM (
    'weekly',
    'biweekly',
    'thrice_weekly'
);


ALTER TYPE "public"."session_frequency" OWNER TO "postgres";


CREATE TYPE "public"."session_time" AS ENUM (
    '9AM',
    '12PM',
    '3PM',
    '6PM'
);


ALTER TYPE "public"."session_time" OWNER TO "postgres";


CREATE TYPE "public"."tool_type" AS ENUM (
    'chatgpt_plus',
    'lovable_dev',
    'descript',
    'upduo'
);


ALTER TYPE "public"."tool_type" OWNER TO "postgres";


CREATE TYPE "testing"."admin_role" AS ENUM (
    'guide,admin'
);


ALTER TYPE "testing"."admin_role" OWNER TO "postgres";


CREATE TYPE "testing"."app_role" AS ENUM (
    'community_manager,member'
);


ALTER TYPE "testing"."app_role" OWNER TO "postgres";


CREATE TYPE "testing"."gap_status" AS ENUM (
    'open,closed'
);


ALTER TYPE "testing"."gap_status" OWNER TO "postgres";


CREATE TYPE "testing"."pacing_level" AS ENUM (
    'light,moderate,consistent,deep_dive'
);


ALTER TYPE "testing"."pacing_level" OWNER TO "postgres";


CREATE TYPE "testing"."saved_item_type" AS ENUM (
    'microtranslation,idea,resource'
);


ALTER TYPE "testing"."saved_item_type" OWNER TO "postgres";


CREATE TYPE "testing"."session_frequency" AS ENUM (
    'weekly,biweekly,thrice_weekly'
);


ALTER TYPE "testing"."session_frequency" OWNER TO "postgres";


CREATE TYPE "testing"."session_time" AS ENUM (
    '9AM,12PM,3PM,6PM'
);


ALTER TYPE "testing"."session_time" OWNER TO "postgres";


CREATE TYPE "testing"."tool_type" AS ENUM (
    'chatgpt_plus,lovable_dev,descript,upduo'
);


ALTER TYPE "testing"."tool_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."accept_hat_detection"("p_detection_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."accept_hat_detection"("p_detection_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."accept_hat_detection"("p_detection_id" "uuid") IS 'Accepts a hat detection, adds it to the user profile, and records metadata.';



CREATE OR REPLACE FUNCTION "public"."admin_add_beta_user"("user_id" "uuid", "features_array" "public"."beta_feature"[]) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."admin_add_beta_user"("user_id" "uuid", "features_array" "public"."beta_feature"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_pre_enroll_beta_user"("email_address" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."admin_pre_enroll_beta_user"("email_address" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_remove_beta_user"("beta_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."admin_remove_beta_user"("beta_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_remove_pending_beta_email"("email_address" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."admin_remove_pending_beta_email"("email_address" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_sensitive_operations"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."audit_sensitive_operations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auth_user_is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$ SELECT public.is_admin_user(); $$;


ALTER FUNCTION "public"."auth_user_is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_enroll_beta_users"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."auto_enroll_beta_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_complete_matches"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id 
    AND email LIKE '%@sideby.ai'
  );
$$;


ALTER FUNCTION "public"."can_complete_matches"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_column_exists"("table_name" "text", "column_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
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
$_$;


ALTER FUNCTION "public"."check_column_exists"("table_name" "text", "column_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_user_deletion_safety"("user_id_param" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."check_user_deletion_safety"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clean_test_schema"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE 
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'testing'
    LOOP
        EXECUTE format('TRUNCATE TABLE testing.%I CASCADE', r.tablename);
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."clean_test_schema"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."completely_delete_match"("match_id_param" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."completely_delete_match"("match_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."count_user_matches"("user_id" "uuid") RETURNS integer
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT COUNT(*)::integer 
  FROM public.matches
  WHERE (user1_id = user_id OR user2_id = user_id)
  AND status = 'active';
$$;


ALTER FUNCTION "public"."count_user_matches"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_hat_detection"("p_user_id" "uuid", "p_hat_name" "text", "p_source" "text" DEFAULT 'session_transcript'::"text", "p_confidence" double precision DEFAULT NULL::double precision, "p_session_id" "text" DEFAULT NULL::"text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."create_hat_detection"("p_user_id" "uuid", "p_hat_name" "text", "p_source" "text", "p_confidence" double precision, "p_session_id" "text", "p_metadata" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_hat_detection"("p_user_id" "uuid", "p_hat_name" "text", "p_source" "text", "p_confidence" double precision, "p_session_id" "text", "p_metadata" "jsonb") IS 'Stores a hat detection in the database. Used by edge functions and other system components to record hat suggestions.';



CREATE OR REPLACE FUNCTION "public"."create_notification_entry"("p_receiver_id" "uuid", "p_sender_id" "uuid", "p_message_content" "text", "p_match_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."create_notification_entry"("p_receiver_id" "uuid", "p_sender_id" "uuid", "p_message_content" "text", "p_match_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."debug_admin_check"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."debug_admin_check"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user_account"("user_id_param" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."delete_user_account"("user_id_param" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."delete_user_account"("user_id_param" "uuid") IS 'Securely removes all user data from the system, anonymizing content where needed for platform integrity.';



CREATE OR REPLACE FUNCTION "public"."enforce_match_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."enforce_match_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."ensure_user_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_community_members"("community_id_param" "uuid") RETURNS TABLE("community_id" "uuid", "first_name" "text", "last_initial" "text", "pacing_level" "text", "role" "text", "status" "text")
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_community_members"("community_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT auth.uid();
$$;


ALTER FUNCTION "public"."get_current_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_email_template_with_account"("template_key_param" "text") RETURNS TABLE("template_id" "uuid", "template_name" "text", "subject" "text", "header_html" "text", "body_html" "text", "footer_html" "text", "variables" "jsonb", "account_type" "text", "from_email" "text", "from_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."get_email_template_with_account"("template_key_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_email_template_with_account_safe"("template_key_param" "text") RETURNS TABLE("template_id" "uuid", "template_name" "text", "subject" "text", "header_html" "text", "body_html" "text", "footer_html" "text", "variables" "jsonb", "from_email" "text", "from_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."get_email_template_with_account_safe"("template_key_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_data"("user_id" "uuid") RETURNS "json"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT 
    json_build_object(
      'id', id,
      'email', email,
      'created_at', created_at,
      'updated_at', updated_at
    )
  FROM public.profiles
  WHERE id = user_id;
$$;


ALTER FUNCTION "public"."get_user_data"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_last_signin"("user_id" "uuid") RETURNS timestamp with time zone
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."get_user_last_signin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_notification_preferences"("user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT COALESCE(notification_preferences, '{"email": true, "sms": false, "in_app": true}'::jsonb)
  FROM public.profiles 
  WHERE id = user_id;
$$;


ALTER FUNCTION "public"."get_user_notification_preferences"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_weekly_session_counts"("start_date" "date", "end_date" "date") RETURNS TABLE("week_start" "date", "selected_sessions" integer, "kept_sessions" integer)
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_weekly_session_counts"("start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_admin_message"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
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
$_$;


ALTER FUNCTION "public"."handle_admin_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_match_email"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_match_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_admin_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF NEW.email LIKE '%@sideby.ai' THEN
    INSERT INTO public.admin_users (id, role)
    VALUES (NEW.id, 'guide')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_admin_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_chat_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_chat_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_match_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_match_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_notification_request"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_notification_request"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_profile_deletion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_profile_deletion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_posts_deletion"("user_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Update any posts by this user to have a null user_id and deleted status
  UPDATE public.posts 
  SET 
    status = 'deleted',
    user_id = NULL
  WHERE user_id = user_id_param;
  
  -- If we need to handle any other tables that reference posts, we would do it here
END;
$$;


ALTER FUNCTION "public"."handle_user_posts_deletion"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hard_delete_user_account"("user_id_param" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."hard_delete_user_account"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_beta_feature"("user_uuid" "uuid", "feature_name" "public"."beta_feature") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM beta_users
    WHERE user_id = user_uuid
    AND feature_name = ANY(features)
  );
$$;


ALTER FUNCTION "public"."has_beta_feature"("user_uuid" "uuid", "feature_name" "public"."beta_feature") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_community_role"("user_id" "uuid", "community_id" "uuid", "role" "public"."app_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $_$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = $1 
    AND community_id = $2
    AND role = $3
  );
$_$;


ALTER FUNCTION "public"."has_community_role"("user_id" "uuid", "community_id" "uuid", "role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users
    WHERE id = user_id
  );
$$;


ALTER FUNCTION "public"."is_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_user"() RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."is_admin_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_current_user_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$ SELECT public.is_admin_user(); $$;


ALTER FUNCTION "public"."is_current_user_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_phone_verified"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT COALESCE(phone_verified, FALSE) 
  FROM public.profiles 
  WHERE id = user_id;
$$;


ALTER FUNCTION "public"."is_phone_verified"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_post_visible_to_user"("post_id" "uuid", "user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."is_post_visible_to_user"("post_id" "uuid", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_production_environment"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."is_production_environment"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_sideby_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id 
    AND email LIKE '%@sideby.ai'
  );
$$;


ALTER FUNCTION "public"."is_sideby_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_sideby_admin_from_profile"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT public.is_current_user_admin() AND auth.uid() = user_id;
$$;


ALTER FUNCTION "public"."is_sideby_admin_from_profile"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_journey_stage_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."notify_journey_stage_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reject_hat_detection"("p_detection_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.hat_detections
  SET status = 'rejected', updated_at = now()
  WHERE id = p_detection_id;
  
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."reject_hat_detection"("p_detection_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."reject_hat_detection"("p_detection_id" "uuid") IS 'Rejects a hat detection, marking it as rejected in the database.';



CREATE OR REPLACE FUNCTION "public"."remove_user_from_sideby"("user_email" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."remove_user_from_sideby"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."remove_user_from_sideby_improved"("user_email" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."remove_user_from_sideby_improved"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at_for_hat_metadata"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at_for_hat_metadata"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at_for_logs"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at_for_logs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at_for_notifications"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at_for_notifications"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at_for_upduo_mappings"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at_for_upduo_mappings"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at_trigger_for_visibility"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at_trigger_for_visibility"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_user_email"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_user_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_journey_stage_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."track_journey_stage_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_journey_monitor"("force_run" boolean DEFAULT false) RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."trigger_journey_monitor"("force_run" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_notification_digest"() RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."trigger_notification_digest"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_crews_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_crews_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_enhanced_analysis_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_enhanced_analysis_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."use_schema"("schema_name" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    EXECUTE format('SET search_path TO %I, public', schema_name);
END;
$$;


ALTER FUNCTION "public"."use_schema"("schema_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_exists"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = user_id
  );
$$;


ALTER FUNCTION "public"."user_exists"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_admin_operation"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."validate_admin_operation"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "admin_alerts_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'resolved'::"text", 'dismissed'::"text"])))
);


ALTER TABLE "public"."admin_alerts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "data" "jsonb",
    "read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "priority" "text" DEFAULT 'normal'::"text" NOT NULL,
    "channels" "jsonb" DEFAULT '{"sms": false, "email": false, "in_app": true}'::"jsonb",
    "status" "text" DEFAULT 'delivered'::"text" NOT NULL,
    "deduplication_key" "text",
    "processed_at" timestamp with time zone,
    "error" "text"
);

ALTER TABLE ONLY "public"."notifications" REPLICA IDENTITY FULL;


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."admin_notification_metrics" AS
 SELECT "date_trunc"('hour'::"text", "notifications"."created_at") AS "hour",
    "notifications"."type",
    "notifications"."priority",
    "count"(*) AS "total_count",
    "sum"(
        CASE
            WHEN ("notifications"."status" = 'delivered'::"text") THEN 1
            ELSE 0
        END) AS "delivered_count",
    "sum"(
        CASE
            WHEN ("notifications"."status" = 'failed'::"text") THEN 1
            ELSE 0
        END) AS "failed_count",
    "sum"(
        CASE
            WHEN ("notifications"."error" IS NOT NULL) THEN 1
            ELSE 0
        END) AS "error_count"
   FROM "public"."notifications"
  GROUP BY ("date_trunc"('hour'::"text", "notifications"."created_at")), "notifications"."type", "notifications"."priority"
  ORDER BY ("date_trunc"('hour'::"text", "notifications"."created_at")) DESC;


ALTER TABLE "public"."admin_notification_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "bio" "text",
    "teaching_experience" "text",
    "subjects" "text"[],
    "certifications" "text"[],
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "subject_statuses" "jsonb"[] DEFAULT ARRAY[]::"jsonb"[],
    "email" "text" NOT NULL,
    "email_preferences" "jsonb" DEFAULT '{"chat_notifications": true}'::"jsonb",
    "approved_stance" "text",
    "impersonating_user_id" "uuid",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "deleted_at" timestamp with time zone,
    "onboarding_completed" boolean DEFAULT false NOT NULL,
    "phone_number" "text",
    "notification_preferences" "jsonb" DEFAULT '{"sms": false, "email": true, "in_app": true}'::"jsonb",
    "phone_verified" boolean DEFAULT false,
    "phone_verification_code" "text",
    "phone_verification_sent_at" timestamp with time zone,
    "approved_flow_activity" "text",
    "has_completed_reflection" boolean DEFAULT false,
    "primary_flow_activity" "text",
    "metadata" "jsonb",
    "journey_stage" "text" DEFAULT 'new'::"text",
    "has_partial_reflection" boolean DEFAULT false,
    "reflection_quality_score" integer DEFAULT 0,
    "location" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."has_completed_reflection" IS 'Manually set flag for users who have completed reflection';



COMMENT ON COLUMN "public"."profiles"."metadata" IS 'Additional metadata for user profiles stored as JSON';



CREATE TABLE IF NOT EXISTS "public"."user_availability" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "time_slots" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "pacing_level" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_availability" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."admin_user_availability_view" AS
 SELECT "ua"."id",
    "ua"."user_id",
    "p"."first_name",
    "p"."last_name",
    "p"."email",
    "ua"."pacing_level",
    "ua"."time_slots",
    "ua"."created_at",
    "ua"."updated_at"
   FROM ("public"."user_availability" "ua"
     JOIN "public"."profiles" "p" ON (("ua"."user_id" = "p"."id")))
  WHERE ("p"."email" ~~ '%@sideby.ai'::"text")
  ORDER BY "p"."first_name", "p"."last_name";


ALTER TABLE "public"."admin_user_availability_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" NOT NULL,
    "role" "public"."admin_role" DEFAULT 'guide'::"public"."admin_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."beta_user_pending_emails" (
    "email" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."beta_user_pending_emails" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."beta_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "features" "public"."beta_feature"[] DEFAULT ARRAY[]::"public"."beta_feature"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."beta_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."communities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."communities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_feature_flags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "community_id" "uuid" NOT NULL,
    "feature_name" "text" NOT NULL,
    "description" "text",
    "enabled" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."community_feature_flags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "community_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."community_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_pacing" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "community_id" "uuid" NOT NULL,
    "light_description" "text" DEFAULT 'Monthly engagement with casual participation'::"text",
    "moderate_description" "text" DEFAULT 'Biweekly participation with regular involvement'::"text",
    "consistent_description" "text" DEFAULT 'Weekly participation with steady involvement'::"text",
    "deep_dive_description" "text" DEFAULT 'Thrice weekly participation with high commitment'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."community_pacing" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crew_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "crew_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "is_lead" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."crew_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."crews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."engagement_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "community_id" "uuid" NOT NULL,
    "engagement_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "metadata" "jsonb"
);


ALTER TABLE "public"."engagement_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."engagement_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "community_id" "uuid",
    "planned_sessions" integer DEFAULT 0 NOT NULL,
    "completed_sessions" integer DEFAULT 0 NOT NULL,
    "current_streak" integer DEFAULT 0 NOT NULL,
    "last_engagement_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."engagement_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."enhanced_transcript_analysis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transcript_id" "uuid",
    "user_id" "uuid",
    "emotional_sentiment" "jsonb" NOT NULL,
    "engagement_patterns" "jsonb" NOT NULL,
    "semantic_topics" "jsonb" NOT NULL,
    "expertise_indicators" "jsonb" NOT NULL,
    "learning_moments" "jsonb" NOT NULL,
    "personality_traits" "jsonb" NOT NULL,
    "analysis_version" "text" DEFAULT '1.0'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."enhanced_transcript_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."global_feature_flags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "feature_name" "text" NOT NULL,
    "description" "text",
    "enabled" boolean DEFAULT false NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."global_feature_flags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hat_detections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "hat_name" "text" NOT NULL,
    "source" "text" DEFAULT 'session_transcript'::"text" NOT NULL,
    "confidence" double precision,
    "session_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."hat_detections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hat_embeddings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "hat_name" "text" NOT NULL,
    "embedding" "public"."vector"(1536),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."hat_embeddings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hat_inference_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "original_hat" "text" NOT NULL,
    "session_id" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "result" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."hat_inference_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hat_metadata" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "hat_name" "text" NOT NULL,
    "source" "text" DEFAULT 'manual'::"text" NOT NULL,
    "session_id" "text",
    "confidence" double precision,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."hat_metadata" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hat_similarity_cache" (
    "hat1" "text" NOT NULL,
    "hat2" "text" NOT NULL,
    "similarity" double precision NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."hat_similarity_cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."journey_reminder_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "stage" "text" NOT NULL,
    "reminder_type" "text" NOT NULL,
    "sent_at" timestamp with time zone DEFAULT "now"(),
    "template_id" "uuid",
    "success" boolean DEFAULT true,
    "notification_id" "uuid"
);


ALTER TABLE "public"."journey_reminder_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."journey_reminder_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "stage" "text" NOT NULL,
    "reminder_type" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "content" "text" NOT NULL,
    "cta_text" "text",
    "cta_url" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "bypass_template" boolean DEFAULT false
);


ALTER TABLE "public"."journey_reminder_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."journey_stage_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "stage" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "color" "text",
    "deleted_at" timestamp with time zone,
    "display_order" integer DEFAULT 0,
    "label" "text",
    "value" "text"
);


ALTER TABLE "public"."journey_stage_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."match_admin_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE ONLY "public"."match_admin_messages" REPLICA IDENTITY FULL;


ALTER TABLE "public"."match_admin_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."match_conversation_analysis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "analysis_type" "public"."match_analysis_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."match_conversation_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."match_meeting_times" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "detected_time" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "match_meeting_times_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."match_meeting_times" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."match_scheduling_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "sender_type" "text" DEFAULT 'user'::"text",
    "timezone" "text"
);

ALTER TABLE ONLY "public"."match_scheduling_messages" REPLICA IDENTITY FULL;


ALTER TABLE "public"."match_scheduling_messages" OWNER TO "postgres";


COMMENT ON COLUMN "public"."match_scheduling_messages"."timezone" IS 'User timezone when the message was sent, for proper time conversion in scheduling messages';



CREATE TABLE IF NOT EXISTS "public"."match_user_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."match_user_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user1_id" "uuid" NOT NULL,
    "user2_id" "uuid" NOT NULL,
    "rationale" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_by" "uuid" NOT NULL,
    "email_sent_at" timestamp with time zone,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "completion_notes" "text",
    "completed_at" timestamp with time zone,
    "completed_by" "uuid",
    "upduo_session_id" "text",
    "upduo_session_name" "text",
    CONSTRAINT "different_users" CHECK (("user1_id" <> "user2_id")),
    CONSTRAINT "matches_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'completed'::"text", 'cancelled'::"text"])))
);

ALTER TABLE ONLY "public"."matches" REPLICA IDENTITY FULL;


ALTER TABLE "public"."matches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_delivery_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "notification_id" "uuid" NOT NULL,
    "channel" "text" NOT NULL,
    "success" boolean DEFAULT false NOT NULL,
    "attempt_count" integer DEFAULT 1 NOT NULL,
    "last_attempt_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "error" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "source_table" "text" DEFAULT 'notifications'::"text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notification_delivery_logs_channel_check" CHECK (("channel" = ANY (ARRAY['email'::"text", 'sms'::"text", 'in_app'::"text", 'cron_trigger'::"text", 'edge_function'::"text"])))
);


ALTER TABLE "public"."notification_delivery_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pending_match_announcements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "user1_id" "uuid" NOT NULL,
    "user2_id" "uuid" NOT NULL,
    "scheduled_for" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pending_match_announcements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pending_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notification_type" "text" NOT NULL,
    "channel" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "processed_at" timestamp with time zone,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL
);


ALTER TABLE "public"."pending_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_visibility" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "visibility_type" "text" NOT NULL,
    "visible_to_user_ids" "uuid"[],
    "visible_to_community_ids" "uuid"[],
    "hidden_from_user_ids" "uuid"[],
    "hidden_from_community_ids" "uuid"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" NOT NULL,
    CONSTRAINT "post_visibility_visibility_type_check" CHECK (("visibility_type" = ANY (ARRAY['all'::"text", 'specific_users'::"text", 'specific_communities'::"text", 'hidden'::"text"])))
);


ALTER TABLE "public"."post_visibility" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "content" "text" NOT NULL,
    "type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "experiment_id" "uuid",
    "metadata" "jsonb",
    "image_url" "text",
    "generated_idea" "text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "match_id" "uuid",
    CONSTRAINT "posts_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'deleted'::"text"]))),
    CONSTRAINT "posts_type_check" CHECK (("type" = ANY (ARRAY['text'::"text", 'resource'::"text", 'lesson'::"text", 'ai_trick'::"text", 'upduo_reflection'::"text", 'experiment_stance'::"text"])))
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."posts"."metadata" IS 'Optional metadata like song links in format: {"song_link": "url"}';



CREATE TABLE IF NOT EXISTS "public"."process_gaps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "description" "text" NOT NULL,
    "status" "public"."gap_status" DEFAULT 'open'::"public"."gap_status",
    "created_by" "uuid" NOT NULL,
    "closed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "closed_at" timestamp with time zone
);


ALTER TABLE "public"."process_gaps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_experiments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "suggested_hats" "text"[] DEFAULT ARRAY[]::"text"[],
    "stance_statement" "text",
    "primary_flow_activity" "text",
    "learning_focus" "text"[],
    "teaching_focus" "text"[],
    "analyzed_transcript" "text",
    "source_type" "text" NOT NULL,
    "confidence_score" double precision,
    "is_second_opinion" boolean DEFAULT false,
    "experiment_type" "text" DEFAULT 'stance_from_welcome'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "excitement_areas" "text"[],
    "caution_areas" "text"[],
    "moment_of_brilliance" "text",
    "is_deleted" boolean DEFAULT false NOT NULL,
    "created_by" "uuid",
    CONSTRAINT "valid_experiment_types" CHECK (("experiment_type" = ANY (ARRAY['stance_from_welcome'::"text", 'guts_vs_fear'::"text"])))
);


ALTER TABLE "public"."profile_experiments" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profile_experiments"."experiment_type" IS 'Valid types: stance_from_welcome, guts_vs_fear';



CREATE TABLE IF NOT EXISTS "public"."saved_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "original_post_id" "uuid",
    "content" "text" NOT NULL,
    "type" "public"."saved_item_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "excitement_level" smallint,
    "alignment_level" smallint
);

ALTER TABLE ONLY "public"."saved_items" REPLICA IDENTITY FULL;


ALTER TABLE "public"."saved_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."security_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "operation" "text" NOT NULL,
    "table_name" "text",
    "record_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."security_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sponsorships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tool_name" "text" NOT NULL,
    "store" "text" NOT NULL,
    "district" "text" NOT NULL,
    "region" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."sponsorships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "public"."tool_type" NOT NULL,
    "description" "text",
    "url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "price_per_month" numeric(10,2),
    "status" "text" DEFAULT 'active'::"text" NOT NULL
);


ALTER TABLE "public"."tools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."upduo_session_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pacing_level" "public"."pacing_level" NOT NULL,
    "frequency" "text" NOT NULL,
    "description" "text" NOT NULL
);


ALTER TABLE "public"."upduo_session_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."upduo_transcripts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "conversation_id" "text" NOT NULL,
    "transcript" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "metadata" "jsonb",
    "quality_score" integer DEFAULT 0,
    "session_duration" integer DEFAULT 0,
    "word_count" integer DEFAULT 0
);


ALTER TABLE "public"."upduo_transcripts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."upduo_user_associations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "upduo_user_id" "text" NOT NULL,
    "sideby_user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."upduo_user_associations" OWNER TO "postgres";


COMMENT ON TABLE "public"."upduo_user_associations" IS 'Stores associations between upduo user IDs and Sideby user IDs';



CREATE TABLE IF NOT EXISTS "public"."upduo_user_mappings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "upduo_user_id" "text" NOT NULL,
    "sideby_user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."upduo_user_mappings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_custom_tools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "description" "text",
    "type" "text" DEFAULT 'custom'::"text" NOT NULL,
    CONSTRAINT "user_custom_tools_type_check" CHECK (("type" = ANY (ARRAY['predefined'::"text", 'custom'::"text"])))
);


ALTER TABLE "public"."user_custom_tools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_flow_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_id" "text" NOT NULL,
    "flow_activity" "text",
    "confidence" double precision,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_flow_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_journey_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "previous_stage" "text",
    "new_stage" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."user_journey_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_pacing_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "community_id" "uuid" NOT NULL,
    "pacing_level" "text" DEFAULT 'moderate'::"public"."pacing_level" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "session_time" "public"."session_time" DEFAULT '12PM'::"public"."session_time",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."user_pacing_preferences" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_pacing_preferences_with_names" AS
 SELECT "upp"."id",
    "upp"."user_id",
    "upp"."community_id",
    "upp"."pacing_level",
    "upp"."created_at",
    "upp"."updated_at",
    "upp"."session_time",
    "p"."first_name"
   FROM ("public"."user_pacing_preferences" "upp"
     JOIN "public"."profiles" "p" ON (("p"."id" = "upp"."user_id")));


ALTER TABLE "public"."user_pacing_preferences_with_names" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "community_id" "uuid" NOT NULL,
    "role" "public"."app_role" DEFAULT 'member'::"public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_session_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "frequency" "public"."session_frequency" NOT NULL,
    "start_week" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."user_session_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_tools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tool_id" "uuid" NOT NULL,
    "assigned_by" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."user_tools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."values_acknowledgment" (
    "id" "uuid" NOT NULL,
    "acknowledged_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."values_acknowledgment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."admin_users" (
    "id" "uuid" NOT NULL,
    "role" "public"."admin_role" DEFAULT 'guide'::"public"."admin_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "testing"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "testing"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."communities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "testing"."communities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."community_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "community_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "testing"."community_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."community_pacing" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "community_id" "uuid" NOT NULL,
    "light_description" "text" DEFAULT 'Monthly engagement with casual participation'::"text",
    "moderate_description" "text" DEFAULT 'Biweekly participation with regular involvement'::"text",
    "consistent_description" "text" DEFAULT 'Weekly participation with steady involvement'::"text",
    "deep_dive_description" "text" DEFAULT 'Thrice weekly participation with high commitment'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "testing"."community_pacing" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."connections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "connected_user_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "connections_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text"])))
);


ALTER TABLE "testing"."connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."engagement_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "community_id" "uuid" NOT NULL,
    "engagement_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "testing"."engagement_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."match_scheduling_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "testing"."match_scheduling_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user1_id" "uuid" NOT NULL,
    "user2_id" "uuid" NOT NULL,
    "rationale" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_by" "uuid" NOT NULL,
    "email_sent_at" timestamp with time zone,
    CONSTRAINT "different_users" CHECK (("user1_id" <> "user2_id"))
);


ALTER TABLE "testing"."matches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "posts_type_check" CHECK (("type" = ANY (ARRAY['text'::"text", 'resource'::"text", 'lesson'::"text", 'ai_trick'::"text"])))
);


ALTER TABLE "testing"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."process_gaps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "description" "text" NOT NULL,
    "status" "public"."gap_status" DEFAULT 'open'::"public"."gap_status",
    "created_by" "uuid" NOT NULL,
    "closed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "closed_at" timestamp with time zone
);


ALTER TABLE "testing"."process_gaps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "bio" "text",
    "teaching_experience" "text",
    "subjects" "text"[],
    "certifications" "text"[],
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "subject_statuses" "jsonb"[] DEFAULT ARRAY[]::"jsonb"[],
    "email" "text"
);


ALTER TABLE "testing"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "type" "text" NOT NULL,
    "url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "resources_type_check" CHECK (("type" = ANY (ARRAY['document'::"text", 'link'::"text", 'template'::"text"])))
);


ALTER TABLE "testing"."resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."saved_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "original_post_id" "uuid",
    "content" "text" NOT NULL,
    "type" "public"."saved_item_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "testing"."saved_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."sponsorships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tool_name" "text" NOT NULL,
    "store" "text" NOT NULL,
    "district" "text" NOT NULL,
    "region" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "testing"."sponsorships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."tools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "public"."tool_type" NOT NULL,
    "description" "text",
    "url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "price_per_month" numeric(10,2),
    "status" "text" DEFAULT 'active'::"text" NOT NULL
);


ALTER TABLE "testing"."tools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."upduo_session_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pacing_level" "public"."pacing_level" NOT NULL,
    "frequency" "text" NOT NULL,
    "description" "text" NOT NULL
);


ALTER TABLE "testing"."upduo_session_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."user_pacing_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "community_id" "uuid" NOT NULL,
    "pacing_level" "public"."pacing_level" DEFAULT 'moderate'::"public"."pacing_level" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "session_time" "public"."session_time" DEFAULT '12PM'::"public"."session_time"
);


ALTER TABLE "testing"."user_pacing_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "community_id" "uuid" NOT NULL,
    "role" "public"."app_role" DEFAULT 'member'::"public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "testing"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."user_session_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "frequency" "public"."session_frequency" NOT NULL,
    "start_week" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "testing"."user_session_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."user_tools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tool_id" "uuid" NOT NULL,
    "assigned_by" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "testing"."user_tools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "testing"."values_acknowledgment" (
    "id" "uuid" NOT NULL,
    "acknowledged_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "testing"."values_acknowledgment" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_alerts"
    ADD CONSTRAINT "admin_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."beta_user_pending_emails"
    ADD CONSTRAINT "beta_user_pending_emails_pkey" PRIMARY KEY ("email");



ALTER TABLE ONLY "public"."beta_users"
    ADD CONSTRAINT "beta_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_feature_flags"
    ADD CONSTRAINT "community_feature_flags_community_id_feature_name_key" UNIQUE ("community_id", "feature_name");



ALTER TABLE ONLY "public"."community_feature_flags"
    ADD CONSTRAINT "community_feature_flags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_community_id_user_id_key" UNIQUE ("community_id", "user_id");



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_pacing"
    ADD CONSTRAINT "community_pacing_community_id_key" UNIQUE ("community_id");



ALTER TABLE ONLY "public"."community_pacing"
    ADD CONSTRAINT "community_pacing_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crew_members"
    ADD CONSTRAINT "crew_members_crew_id_user_id_key" UNIQUE ("crew_id", "user_id");



ALTER TABLE ONLY "public"."crew_members"
    ADD CONSTRAINT "crew_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crews"
    ADD CONSTRAINT "crews_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."crews"
    ADD CONSTRAINT "crews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."engagement_logs"
    ADD CONSTRAINT "engagement_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."engagement_stats"
    ADD CONSTRAINT "engagement_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."engagement_stats"
    ADD CONSTRAINT "engagement_stats_user_id_community_id_key" UNIQUE ("user_id", "community_id");



ALTER TABLE ONLY "public"."enhanced_transcript_analysis"
    ADD CONSTRAINT "enhanced_transcript_analysis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enhanced_transcript_analysis"
    ADD CONSTRAINT "enhanced_transcript_analysis_transcript_id_analysis_version_key" UNIQUE ("transcript_id", "analysis_version");



ALTER TABLE ONLY "public"."global_feature_flags"
    ADD CONSTRAINT "global_feature_flags_feature_name_key" UNIQUE ("feature_name");



ALTER TABLE ONLY "public"."global_feature_flags"
    ADD CONSTRAINT "global_feature_flags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hat_detections"
    ADD CONSTRAINT "hat_detections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hat_embeddings"
    ADD CONSTRAINT "hat_embeddings_hat_name_key" UNIQUE ("hat_name");



ALTER TABLE ONLY "public"."hat_embeddings"
    ADD CONSTRAINT "hat_embeddings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hat_inference_requests"
    ADD CONSTRAINT "hat_inference_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hat_metadata"
    ADD CONSTRAINT "hat_metadata_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hat_similarity_cache"
    ADD CONSTRAINT "hat_similarity_cache_pkey" PRIMARY KEY ("hat1", "hat2");



ALTER TABLE ONLY "public"."journey_reminder_logs"
    ADD CONSTRAINT "journey_reminder_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journey_reminder_templates"
    ADD CONSTRAINT "journey_reminder_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journey_reminder_templates"
    ADD CONSTRAINT "journey_reminder_templates_stage_type_key" UNIQUE ("stage", "reminder_type");



ALTER TABLE ONLY "public"."journey_stage_config"
    ADD CONSTRAINT "journey_stage_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journey_stage_config"
    ADD CONSTRAINT "journey_stage_config_stage_key" UNIQUE ("stage");



ALTER TABLE ONLY "public"."journey_stage_config"
    ADD CONSTRAINT "journey_stage_config_value_unique" UNIQUE ("value");



ALTER TABLE ONLY "public"."match_admin_messages"
    ADD CONSTRAINT "match_admin_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_conversation_analysis"
    ADD CONSTRAINT "match_conversation_analysis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_meeting_times"
    ADD CONSTRAINT "match_meeting_times_match_id_detected_time_key" UNIQUE ("match_id", "detected_time");



ALTER TABLE ONLY "public"."match_meeting_times"
    ADD CONSTRAINT "match_meeting_times_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_scheduling_messages"
    ADD CONSTRAINT "match_scheduling_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_user_notes"
    ADD CONSTRAINT "match_user_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_delivery_logs"
    ADD CONSTRAINT "notification_delivery_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pending_match_announcements"
    ADD CONSTRAINT "pending_match_announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pending_notifications"
    ADD CONSTRAINT "pending_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_visibility"
    ADD CONSTRAINT "post_visibility_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."process_gaps"
    ADD CONSTRAINT "process_gaps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_experiments"
    ADD CONSTRAINT "profile_experiments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_items"
    ADD CONSTRAINT "saved_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_audit_logs"
    ADD CONSTRAINT "security_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sponsorships"
    ADD CONSTRAINT "sponsorships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tools"
    ADD CONSTRAINT "tools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_user_notes"
    ADD CONSTRAINT "unique_user_match_note" UNIQUE ("match_id", "user_id");



ALTER TABLE ONLY "public"."upduo_session_schedules"
    ADD CONSTRAINT "upduo_session_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."upduo_transcripts"
    ADD CONSTRAINT "upduo_transcripts_conversation_id_key" UNIQUE ("conversation_id");



ALTER TABLE ONLY "public"."upduo_transcripts"
    ADD CONSTRAINT "upduo_transcripts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."upduo_user_associations"
    ADD CONSTRAINT "upduo_user_associations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."upduo_user_associations"
    ADD CONSTRAINT "upduo_user_associations_upduo_user_id_key" UNIQUE ("upduo_user_id");



ALTER TABLE ONLY "public"."upduo_user_mappings"
    ADD CONSTRAINT "upduo_user_mappings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."upduo_user_mappings"
    ADD CONSTRAINT "upduo_user_mappings_upduo_user_id_key" UNIQUE ("upduo_user_id");



ALTER TABLE ONLY "public"."user_availability"
    ADD CONSTRAINT "user_availability_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_custom_tools"
    ADD CONSTRAINT "user_custom_tools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_flow_activities"
    ADD CONSTRAINT "user_flow_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_flow_activities"
    ADD CONSTRAINT "user_flow_activities_user_id_session_id_key" UNIQUE ("user_id", "session_id");



ALTER TABLE ONLY "public"."user_journey_events"
    ADD CONSTRAINT "user_journey_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_pacing_preferences"
    ADD CONSTRAINT "user_pacing_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_pacing_preferences"
    ADD CONSTRAINT "user_pacing_preferences_user_id_community_id_key" UNIQUE ("user_id", "community_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_community_id_key" UNIQUE ("user_id", "community_id");



ALTER TABLE ONLY "public"."user_session_schedules"
    ADD CONSTRAINT "user_session_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_tools"
    ADD CONSTRAINT "user_tools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_tools"
    ADD CONSTRAINT "user_tools_user_id_tool_id_key" UNIQUE ("user_id", "tool_id");



ALTER TABLE ONLY "public"."values_acknowledgment"
    ADD CONSTRAINT "values_acknowledgment_user_unique" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."communities"
    ADD CONSTRAINT "communities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."community_members"
    ADD CONSTRAINT "community_members_community_id_user_id_key" UNIQUE ("community_id", "user_id");



ALTER TABLE ONLY "testing"."community_members"
    ADD CONSTRAINT "community_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."community_pacing"
    ADD CONSTRAINT "community_pacing_community_id_key" UNIQUE ("community_id");



ALTER TABLE ONLY "testing"."community_pacing"
    ADD CONSTRAINT "community_pacing_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."connections"
    ADD CONSTRAINT "connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."connections"
    ADD CONSTRAINT "connections_user_id_connected_user_id_key" UNIQUE ("user_id", "connected_user_id");



ALTER TABLE ONLY "testing"."engagement_logs"
    ADD CONSTRAINT "engagement_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."match_scheduling_messages"
    ADD CONSTRAINT "match_scheduling_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."matches"
    ADD CONSTRAINT "matches_user1_id_user2_id_key" UNIQUE ("user1_id", "user2_id");



ALTER TABLE ONLY "testing"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."process_gaps"
    ADD CONSTRAINT "process_gaps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."resources"
    ADD CONSTRAINT "resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."saved_items"
    ADD CONSTRAINT "saved_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."sponsorships"
    ADD CONSTRAINT "sponsorships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."tools"
    ADD CONSTRAINT "tools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."upduo_session_schedules"
    ADD CONSTRAINT "upduo_session_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."user_pacing_preferences"
    ADD CONSTRAINT "user_pacing_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."user_pacing_preferences"
    ADD CONSTRAINT "user_pacing_preferences_user_id_community_id_key" UNIQUE ("user_id", "community_id");



ALTER TABLE ONLY "testing"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_community_id_key" UNIQUE ("user_id", "community_id");



ALTER TABLE ONLY "testing"."user_session_schedules"
    ADD CONSTRAINT "user_session_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."user_tools"
    ADD CONSTRAINT "user_tools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "testing"."user_tools"
    ADD CONSTRAINT "user_tools_user_id_tool_id_key" UNIQUE ("user_id", "tool_id");



ALTER TABLE ONLY "testing"."values_acknowledgment"
    ADD CONSTRAINT "values_acknowledgment_pkey" PRIMARY KEY ("id");



CREATE INDEX "admin_alerts_match_id_idx" ON "public"."admin_alerts" USING "btree" ("match_id");



CREATE INDEX "admin_alerts_status_idx" ON "public"."admin_alerts" USING "btree" ("status");



CREATE INDEX "hat_detections_user_id_idx" ON "public"."hat_detections" USING "btree" ("user_id");



CREATE INDEX "idx_enhanced_analysis_created_at" ON "public"."enhanced_transcript_analysis" USING "btree" ("created_at");



CREATE INDEX "idx_enhanced_analysis_emotional" ON "public"."enhanced_transcript_analysis" USING "gin" ("emotional_sentiment");



CREATE INDEX "idx_enhanced_analysis_expertise" ON "public"."enhanced_transcript_analysis" USING "gin" ("expertise_indicators");



CREATE INDEX "idx_enhanced_analysis_semantic_topics" ON "public"."enhanced_transcript_analysis" USING "gin" ("semantic_topics");



CREATE INDEX "idx_enhanced_analysis_transcript_id" ON "public"."enhanced_transcript_analysis" USING "btree" ("transcript_id");



CREATE INDEX "idx_enhanced_analysis_user_id" ON "public"."enhanced_transcript_analysis" USING "btree" ("user_id");



CREATE INDEX "idx_journey_stage_config_order" ON "public"."journey_stage_config" USING "btree" ("display_order");



CREATE INDEX "idx_journey_stage_config_stage" ON "public"."journey_stage_config" USING "btree" ("stage");



CREATE INDEX "idx_match_user_notes_match_user" ON "public"."match_user_notes" USING "btree" ("match_id", "user_id");



CREATE INDEX "idx_notification_delivery_logs_channel" ON "public"."notification_delivery_logs" USING "btree" ("channel");



CREATE INDEX "idx_notification_delivery_logs_notification_id" ON "public"."notification_delivery_logs" USING "btree" ("notification_id");



CREATE INDEX "idx_notification_delivery_logs_source_table" ON "public"."notification_delivery_logs" USING "btree" ("source_table");



CREATE INDEX "idx_notifications_deduplication" ON "public"."notifications" USING "btree" ("user_id", "deduplication_key") WHERE ("deduplication_key" IS NOT NULL);



CREATE INDEX "idx_notifications_user_status" ON "public"."notifications" USING "btree" ("user_id", "read", "created_at" DESC);



CREATE INDEX "idx_pending_announcements_scheduled" ON "public"."pending_match_announcements" USING "btree" ("scheduled_for");



CREATE INDEX "idx_pending_announcements_status" ON "public"."pending_match_announcements" USING "btree" ("status");



CREATE INDEX "idx_pending_notifications_status_channel" ON "public"."pending_notifications" USING "btree" ("status", "channel");



CREATE INDEX "idx_pending_notifications_user_id" ON "public"."pending_notifications" USING "btree" ("user_id");



CREATE INDEX "idx_posts_match_id" ON "public"."posts" USING "btree" ("match_id");



CREATE INDEX "idx_profiles_reflection_quality" ON "public"."profiles" USING "btree" ("reflection_quality_score", "has_completed_reflection");



CREATE INDEX "idx_upduo_transcripts_created_at" ON "public"."upduo_transcripts" USING "btree" ("created_at");



CREATE INDEX "idx_upduo_transcripts_quality" ON "public"."upduo_transcripts" USING "btree" ("quality_score", "session_duration");



CREATE INDEX "idx_upduo_transcripts_user_id" ON "public"."upduo_transcripts" USING "btree" ("user_id");



CREATE INDEX "idx_upduo_user_associations_sideby_user_id" ON "public"."upduo_user_associations" USING "btree" ("sideby_user_id");



CREATE INDEX "idx_upduo_user_associations_upduo_user_id" ON "public"."upduo_user_associations" USING "btree" ("upduo_user_id");



CREATE INDEX "idx_upduo_user_mappings_sideby_user_id" ON "public"."upduo_user_mappings" USING "btree" ("sideby_user_id");



CREATE INDEX "idx_upduo_user_mappings_upduo_user_id" ON "public"."upduo_user_mappings" USING "btree" ("upduo_user_id");



CREATE INDEX "idx_user_custom_tools_user_type" ON "public"."user_custom_tools" USING "btree" ("user_id", "type");



CREATE INDEX "journey_reminder_logs_user_stage_idx" ON "public"."journey_reminder_logs" USING "btree" ("user_id", "stage");



CREATE INDEX "notifications_read_idx" ON "public"."notifications" USING "btree" ("read");



CREATE INDEX "notifications_user_id_idx" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "profile_experiments_type_idx" ON "public"."profile_experiments" USING "btree" ("experiment_type");



CREATE UNIQUE INDEX "profiles_email_unique_idx" ON "public"."profiles" USING "btree" ("email");



CREATE UNIQUE INDEX "unique_active_match" ON "public"."matches" USING "btree" (LEAST("user1_id", "user2_id"), GREATEST("user1_id", "user2_id")) WHERE ("status" = 'active'::"text");



COMMENT ON INDEX "public"."unique_active_match" IS 'Ensures users can only have one active match between them at a time';



CREATE INDEX "user_journey_events_stage_date_idx" ON "public"."user_journey_events" USING "btree" ("new_stage", "created_at");



CREATE INDEX "user_journey_events_user_id_idx" ON "public"."user_journey_events" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "audit_matches" AFTER INSERT OR DELETE OR UPDATE ON "public"."matches" FOR EACH ROW EXECUTE FUNCTION "public"."audit_sensitive_operations"();



CREATE OR REPLACE TRIGGER "audit_profiles" AFTER INSERT OR DELETE OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."audit_sensitive_operations"();



CREATE OR REPLACE TRIGGER "auto_enroll_beta_users_trigger" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."auto_enroll_beta_users"();



CREATE OR REPLACE TRIGGER "enforce_match_limit_trigger" BEFORE INSERT ON "public"."matches" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_match_limit"();



CREATE OR REPLACE TRIGGER "handle_admin_message_before_insert" BEFORE INSERT ON "public"."match_scheduling_messages" FOR EACH ROW EXECUTE FUNCTION "public"."handle_admin_message"();



CREATE OR REPLACE TRIGGER "handle_match_email" AFTER INSERT ON "public"."matches" FOR EACH ROW EXECUTE FUNCTION "public"."handle_match_email"();



CREATE OR REPLACE TRIGGER "on_new_message_notification" AFTER INSERT ON "public"."match_scheduling_messages" FOR EACH ROW EXECUTE FUNCTION "public"."handle_notification_request"();



CREATE OR REPLACE TRIGGER "profile_deletion_trigger" AFTER UPDATE OF "status" ON "public"."profiles" FOR EACH ROW WHEN (("new"."status" = 'deleted'::"text")) EXECUTE FUNCTION "public"."handle_profile_deletion"();



CREATE OR REPLACE TRIGGER "profile_journey_stage_tracking" AFTER UPDATE OF "has_completed_reflection" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."track_journey_stage_change"();



CREATE OR REPLACE TRIGGER "set_hat_detections_updated_at" BEFORE UPDATE ON "public"."hat_detections" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."engagement_stats" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."match_admin_messages" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."match_conversation_analysis" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."match_meeting_times" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."match_scheduling_messages" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."profile_experiments" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."saved_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."tools" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."upduo_transcripts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."user_availability" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."user_session_schedules" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."user_tools" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp_admin_alerts" BEFORE UPDATE ON "public"."admin_alerts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp_journey_reminder_templates" BEFORE UPDATE ON "public"."journey_reminder_templates" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp_post_visibility" BEFORE UPDATE ON "public"."post_visibility" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at_trigger_for_visibility"();



CREATE OR REPLACE TRIGGER "set_timestamp_upduo_user_associations" BEFORE UPDATE ON "public"."upduo_user_associations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."community_pacing" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."process_gaps" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."saved_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."sponsorships" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."user_custom_tools" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."user_pacing_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_for_notifications" BEFORE UPDATE ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at_for_notifications"();



CREATE OR REPLACE TRIGGER "set_updated_at_hat_inference_requests" BEFORE UPDATE ON "public"."hat_inference_requests" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at_for_hat_metadata"();



CREATE OR REPLACE TRIGGER "set_updated_at_hat_metadata" BEFORE UPDATE ON "public"."hat_metadata" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at_for_hat_metadata"();



CREATE OR REPLACE TRIGGER "set_updated_at_trigger" BEFORE UPDATE ON "public"."notification_delivery_logs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at_for_logs"();



CREATE OR REPLACE TRIGGER "set_updated_at_trigger_for_upduo_mappings" BEFORE UPDATE ON "public"."upduo_user_mappings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at_for_upduo_mappings"();



CREATE OR REPLACE TRIGGER "track_journey_stage_changes" AFTER UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."track_journey_stage_change"();



CREATE OR REPLACE TRIGGER "trigger_journey_stage_change" AFTER UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."notify_journey_stage_change"();



CREATE OR REPLACE TRIGGER "trigger_update_enhanced_analysis_updated_at" BEFORE UPDATE ON "public"."enhanced_transcript_analysis" FOR EACH ROW EXECUTE FUNCTION "public"."update_enhanced_analysis_updated_at"();



CREATE OR REPLACE TRIGGER "update_crews_updated_at" BEFORE UPDATE ON "public"."crews" FOR EACH ROW EXECUTE FUNCTION "public"."update_crews_updated_at"();



ALTER TABLE ONLY "public"."admin_alerts"
    ADD CONSTRAINT "admin_alerts_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."beta_users"
    ADD CONSTRAINT "beta_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."community_feature_flags"
    ADD CONSTRAINT "community_feature_flags_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id");



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."community_pacing"
    ADD CONSTRAINT "community_pacing_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crew_members"
    ADD CONSTRAINT "crew_members_crew_id_fkey" FOREIGN KEY ("crew_id") REFERENCES "public"."crews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crew_members"
    ADD CONSTRAINT "crew_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."engagement_logs"
    ADD CONSTRAINT "engagement_logs_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id");



ALTER TABLE ONLY "public"."engagement_logs"
    ADD CONSTRAINT "engagement_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."engagement_stats"
    ADD CONSTRAINT "engagement_stats_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."engagement_stats"
    ADD CONSTRAINT "engagement_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crew_members"
    ADD CONSTRAINT "fk_crew_members_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "fk_posts_match_id" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."enhanced_transcript_analysis"
    ADD CONSTRAINT "fk_transcript_id" FOREIGN KEY ("transcript_id") REFERENCES "public"."upduo_transcripts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enhanced_transcript_analysis"
    ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hat_detections"
    ADD CONSTRAINT "hat_detections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."hat_inference_requests"
    ADD CONSTRAINT "hat_inference_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hat_metadata"
    ADD CONSTRAINT "hat_metadata_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."journey_reminder_logs"
    ADD CONSTRAINT "journey_reminder_logs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."journey_reminder_templates"("id");



ALTER TABLE ONLY "public"."journey_reminder_logs"
    ADD CONSTRAINT "journey_reminder_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_admin_messages"
    ADD CONSTRAINT "match_admin_messages_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_conversation_analysis"
    ADD CONSTRAINT "match_conversation_analysis_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id");



ALTER TABLE ONLY "public"."match_meeting_times"
    ADD CONSTRAINT "match_meeting_times_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id");



ALTER TABLE ONLY "public"."match_scheduling_messages"
    ADD CONSTRAINT "match_scheduling_messages_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_scheduling_messages"
    ADD CONSTRAINT "match_scheduling_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."match_user_notes"
    ADD CONSTRAINT "match_user_notes_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_delivery_logs"
    ADD CONSTRAINT "notification_delivery_logs_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pending_match_announcements"
    ADD CONSTRAINT "pending_match_announcements_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pending_notifications"
    ADD CONSTRAINT "pending_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."post_visibility"
    ADD CONSTRAINT "post_visibility_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."post_visibility"
    ADD CONSTRAINT "post_visibility_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "public"."profile_experiments"("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."process_gaps"
    ADD CONSTRAINT "process_gaps_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."process_gaps"
    ADD CONSTRAINT "process_gaps_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profile_experiments"
    ADD CONSTRAINT "profile_experiments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profile_experiments"
    ADD CONSTRAINT "profile_experiments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_impersonating_user_id_fkey" FOREIGN KEY ("impersonating_user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."saved_items"
    ADD CONSTRAINT "saved_items_original_post_id_fkey" FOREIGN KEY ("original_post_id") REFERENCES "public"."posts"("id");



ALTER TABLE ONLY "public"."saved_items"
    ADD CONSTRAINT "saved_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."security_audit_logs"
    ADD CONSTRAINT "security_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sponsorships"
    ADD CONSTRAINT "sponsorships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."upduo_transcripts"
    ADD CONSTRAINT "upduo_transcripts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."upduo_user_associations"
    ADD CONSTRAINT "upduo_user_associations_sideby_user_id_fkey" FOREIGN KEY ("sideby_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_availability"
    ADD CONSTRAINT "user_availability_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_custom_tools"
    ADD CONSTRAINT "user_custom_tools_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_flow_activities"
    ADD CONSTRAINT "user_flow_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."user_journey_events"
    ADD CONSTRAINT "user_journey_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_pacing_preferences"
    ADD CONSTRAINT "user_pacing_preferences_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id");



ALTER TABLE ONLY "public"."user_pacing_preferences"
    ADD CONSTRAINT "user_pacing_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_session_schedules"
    ADD CONSTRAINT "user_session_schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."user_tools"
    ADD CONSTRAINT "user_tools_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_tools"
    ADD CONSTRAINT "user_tools_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_tools"
    ADD CONSTRAINT "user_tools_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."values_acknowledgment"
    ADD CONSTRAINT "values_acknowledgment_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin access to audit logs" ON "public"."security_audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."email")::"text" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Admin users can insert hat embeddings" ON "public"."hat_embeddings" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Admin users can insert hat similarities" ON "public"."hat_similarity_cache" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Admin users can insert profiles" ON "public"."profiles" FOR INSERT WITH CHECK ("public"."is_current_user_admin"());



CREATE POLICY "Admin users can manage admin alerts" ON "public"."admin_alerts" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Admin users can manage all experiments" ON "public"."profile_experiments" USING ("public"."is_sideby_admin"("auth"."uid"())) WITH CHECK ("public"."is_sideby_admin"("auth"."uid"()));



CREATE POLICY "Admin users can manage match announcements" ON "public"."pending_match_announcements" USING ("public"."is_sideby_admin"("auth"."uid"())) WITH CHECK ("public"."is_sideby_admin"("auth"."uid"()));



CREATE POLICY "Admin users can update all profiles" ON "public"."profiles" FOR UPDATE USING ("public"."is_current_user_admin"());



CREATE POLICY "Admin users can update hat embeddings" ON "public"."hat_embeddings" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Admin users can update hat similarities" ON "public"."hat_similarity_cache" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Admin users can view all profiles" ON "public"."profiles" FOR SELECT USING ("public"."is_current_user_admin"());



CREATE POLICY "Admin users can view hat embeddings" ON "public"."hat_embeddings" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Admin users can view hat similarities" ON "public"."hat_similarity_cache" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Admins can create matches" ON "public"."matches" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete matches" ON "public"."matches" FOR DELETE TO "authenticated" USING ("public"."is_sideby_admin"("auth"."uid"()));



CREATE POLICY "Admins can do anything with alerts" ON "public"."admin_alerts" TO "authenticated" USING (("auth"."email"() ~~ '%@sideby.ai'::"text")) WITH CHECK (("auth"."email"() ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Admins can insert matches" ON "public"."matches" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_sideby_admin"("auth"."uid"()));



CREATE POLICY "Admins can insert messages" ON "public"."match_admin_messages" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_sideby_admin"("auth"."uid"()));



CREATE POLICY "Admins can insert notification logs" ON "public"."notification_delivery_logs" FOR INSERT WITH CHECK ("public"."is_sideby_admin"("auth"."uid"()));



CREATE POLICY "Admins can insert pacing preferences for any user" ON "public"."user_pacing_preferences" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Admins can insert process gaps" ON "public"."process_gaps" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Admins can manage all matches" ON "public"."matches" TO "authenticated" USING ("public"."is_current_user_admin"());



CREATE POLICY "Admins can manage all notifications" ON "public"."notifications" TO "authenticated" USING ("public"."is_current_user_admin"());



CREATE POLICY "Admins can manage all upduo user associations" ON "public"."upduo_user_associations" USING ("public"."is_sideby_admin"("auth"."uid"())) WITH CHECK ("public"."is_sideby_admin"("auth"."uid"()));



CREATE POLICY "Admins can manage community feature flags" ON "public"."community_feature_flags" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can manage global feature flags" ON "public"."global_feature_flags" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Admins can manage post visibility" ON "public"."post_visibility" USING ("public"."is_sideby_admin"("auth"."uid"())) WITH CHECK ("public"."is_sideby_admin"("auth"."uid"()));



CREATE POLICY "Admins can manage tool assignments" ON "public"."user_tools" TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Admins can manage tools" ON "public"."tools" TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Admins can read all messages" ON "public"."match_admin_messages" FOR SELECT TO "authenticated" USING ("public"."is_sideby_admin"("auth"."uid"()));



CREATE POLICY "Admins can read all pacing preferences" ON "public"."user_pacing_preferences" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Admins can select all matches" ON "public"."matches" FOR SELECT TO "authenticated" USING ("public"."is_sideby_admin"("auth"."uid"()));



CREATE POLICY "Admins can update match completion" ON "public"."matches" FOR UPDATE TO "authenticated" USING ("public"."can_complete_matches"("auth"."uid"())) WITH CHECK ("public"."can_complete_matches"("auth"."uid"()));



CREATE POLICY "Admins can update matches" ON "public"."matches" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "users"."id"
   FROM "auth"."users"
  WHERE (("users"."email")::"text" ~~ '%@sideby.ai'::"text")))) WITH CHECK (("auth"."uid"() IN ( SELECT "users"."id"
   FROM "auth"."users"
  WHERE (("users"."email")::"text" ~~ '%@sideby.ai'::"text"))));



CREATE POLICY "Admins can update process gaps" ON "public"."process_gaps" FOR UPDATE TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Admins can update their admin messages" ON "public"."match_admin_messages" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."email")::"text" ~~ '%@sideby.ai'::"text")))) AND ("auth"."uid"() = "sender_id")));



CREATE POLICY "Admins can view all admin users" ON "public"."admin_users" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Admins can view all community memberships" ON "public"."community_members" TO "authenticated" USING ("public"."is_current_user_admin"());



CREATE POLICY "Admins can view all matches" ON "public"."matches" TO "authenticated" USING ("public"."is_sideby_admin"("auth"."uid"()));



CREATE POLICY "Admins can view all notification logs" ON "public"."notification_delivery_logs" FOR SELECT USING ("public"."is_sideby_admin"("auth"."uid"()));



CREATE POLICY "Admins can view all pacing preferences" ON "public"."user_pacing_preferences" TO "authenticated" USING ("public"."is_current_user_admin"());



CREATE POLICY "Admins can view all process gaps" ON "public"."process_gaps" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Admins can view all saved items" ON "public"."saved_items" FOR SELECT USING ((("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."email" ~~ '%@sideby.ai'::"text"))) OR ("auth"."uid"() = "user_id")));



CREATE POLICY "Admins can view all user availability" ON "public"."user_availability" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Admins can view all values acknowledgments" ON "public"."values_acknowledgment" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."email")::"text" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Admins have full access to flow activities" ON "public"."user_flow_activities" USING ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."journey_reminder_logs" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Allow admin full access" ON "public"."journey_reminder_templates" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Allow admin full access" ON "public"."journey_stage_config" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Allow admin users full access" ON "public"."profile_experiments" USING ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Allow admins to insert matches" ON "public"."matches" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Allow admins to manage notifications" ON "public"."pending_notifications" USING ("public"."is_sideby_admin"("auth"."uid"()));



CREATE POLICY "Allow admins to read matches" ON "public"."matches" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Allow admins to update matches" ON "public"."matches" FOR UPDATE TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Allow admins to view all matches" ON "public"."matches" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Allow admins to view all scheduling messages" ON "public"."match_scheduling_messages" TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Allow admins to view matches" ON "public"."matches" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Allow authenticated read access" ON "public"."journey_reminder_logs" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated read access" ON "public"."journey_reminder_templates" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated read access" ON "public"."journey_stage_config" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow insert for authenticated users" ON "public"."upduo_user_mappings" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow reading matches" ON "public"."matches" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user1_id") OR ("auth"."uid"() = "user2_id") OR "public"."can_complete_matches"("auth"."uid"())));



CREATE POLICY "Allow select for authenticated users" ON "public"."upduo_user_mappings" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow sideby admins full access to messages" ON "public"."match_scheduling_messages" TO "authenticated" USING ("public"."is_sideby_admin"("auth"."uid"()));



CREATE POLICY "Allow sideby.ai users to complete matches" ON "public"."matches" FOR UPDATE TO "authenticated" USING ("public"."can_complete_matches"("auth"."uid"())) WITH CHECK ("public"."can_complete_matches"("auth"."uid"()));



CREATE POLICY "Allow users to delete their own posts" ON "public"."posts" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert messages for their matches" ON "public"."match_scheduling_messages" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IN ( SELECT "matches"."user1_id"
   FROM "public"."matches"
  WHERE ("matches"."id" = "match_scheduling_messages"."match_id")
UNION
 SELECT "matches"."user2_id"
   FROM "public"."matches"
  WHERE ("matches"."id" = "match_scheduling_messages"."match_id"))));



CREATE POLICY "Allow users to insert their own posts" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to read their own match messages" ON "public"."match_scheduling_messages" FOR SELECT TO "authenticated" USING (("auth"."uid"() IN ( SELECT "matches"."user1_id"
   FROM "public"."matches"
  WHERE ("matches"."id" = "match_scheduling_messages"."match_id")
UNION
 SELECT "matches"."user2_id"
   FROM "public"."matches"
  WHERE ("matches"."id" = "match_scheduling_messages"."match_id"))));



CREATE POLICY "Allow users to see all posts" ON "public"."posts" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow users to update their own posts" ON "public"."posts" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Anyone can insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can read communities" ON "public"."communities" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can view post visibility" ON "public"."post_visibility" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view communities" ON "public"."communities" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Comments are viewable by everyone" ON "public"."comments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Communities are viewable by authenticated users" ON "public"."communities" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Communities are viewable by everyone" ON "public"."communities" FOR SELECT USING (true);



CREATE POLICY "Community managers can insert roles" ON "public"."user_roles" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_community_role"("auth"."uid"(), "community_id", 'community_manager'::"public"."app_role"));



CREATE POLICY "Community managers can update roles" ON "public"."user_roles" FOR UPDATE TO "authenticated" USING ("public"."has_community_role"("auth"."uid"(), "community_id", 'community_manager'::"public"."app_role"));



CREATE POLICY "Community members can read their community's feature flags" ON "public"."community_feature_flags" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."community_members"
  WHERE (("community_members"."user_id" = "auth"."uid"()) AND ("community_members"."community_id" = "community_feature_flags"."community_id") AND ("community_members"."status" = 'active'::"text")))));



CREATE POLICY "Community pacing settings are viewable by everyone" ON "public"."community_pacing" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Crew members are viewable by everyone" ON "public"."crew_members" FOR SELECT USING (true);



CREATE POLICY "Crew members can be added by admins" ON "public"."crew_members" FOR INSERT WITH CHECK (("auth"."email"() ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Crew members can be updated by admins" ON "public"."crew_members" FOR UPDATE USING (("auth"."email"() ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Crews can be created by sideby admins" ON "public"."crews" FOR INSERT WITH CHECK (("auth"."email"() ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Crews can be updated by sideby admins" ON "public"."crews" FOR UPDATE USING (("auth"."email"() ~~ '%@sideby.ai'::"text"));



CREATE POLICY "Enable insert access for users on own values acknowledgment" ON "public"."values_acknowledgment" FOR INSERT WITH CHECK (("id" = "public"."get_current_user_id"()));



CREATE POLICY "Enable read access for users on own values acknowledgment" ON "public"."values_acknowledgment" FOR SELECT USING (("id" = "public"."get_current_user_id"()));



CREATE POLICY "Everyone can read global feature flags" ON "public"."global_feature_flags" FOR SELECT TO "authenticated" USING (("active" = true));



CREATE POLICY "Only admins can modify beta status" ON "public"."beta_users" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Posts are viewable by everyone" ON "public"."posts" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Public crews are viewable by everyone" ON "public"."crews" FOR SELECT USING (true);



CREATE POLICY "Service role can insert notification logs" ON "public"."notification_delivery_logs" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage all notifications" ON "public"."notifications" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can update notification logs" ON "public"."notification_delivery_logs" FOR UPDATE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Sideby admins can insert match analysis" ON "public"."match_conversation_analysis" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."email")::"text" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "Sideby admins can read match analysis" ON "public"."match_conversation_analysis" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."email")::"text" ~~ '%@sideby.ai'::"text")))));



CREATE POLICY "System can insert engagement stats" ON "public"."engagement_stats" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "System can insert hat detections" ON "public"."hat_detections" FOR INSERT WITH CHECK (true);



CREATE POLICY "Tools are viewable by authenticated users" ON "public"."tools" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Upduo schedules are viewable by everyone" ON "public"."upduo_session_schedules" FOR SELECT USING (true);



CREATE POLICY "Users can create alerts" ON "public"."admin_alerts" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create comments" ON "public"."comments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create engagement logs" ON "public"."engagement_logs" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create posts" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create sponsorship claims" ON "public"."sponsorships" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own custom tools" ON "public"."user_custom_tools" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own match notes" ON "public"."match_user_notes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own pacing preferences" ON "public"."user_pacing_preferences" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own schedules" ON "public"."user_session_schedules" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own comments" ON "public"."comments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own pacing preferences" ON "public"."user_pacing_preferences" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own custom tools" ON "public"."user_custom_tools" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own match notes" ON "public"."match_user_notes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own saved items" ON "public"."saved_items" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert messages for their matches" ON "public"."match_scheduling_messages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."matches"
  WHERE (("matches"."id" = "match_scheduling_messages"."match_id") AND (("matches"."user1_id" = "auth"."uid"()) OR ("matches"."user2_id" = "auth"."uid"()))))));



CREATE POLICY "Users can insert own posts" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own acknowledgment" ON "public"."values_acknowledgment" FOR INSERT WITH CHECK ((("auth"."uid"() = "id") OR "public"."is_current_user_admin"()));



CREATE POLICY "Users can insert their own availability" ON "public"."user_availability" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own community membership" ON "public"."community_members" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own pacing preferences" ON "public"."user_pacing_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own saved items" ON "public"."saved_items" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text"))))));



CREATE POLICY "Users can insert their own transcripts" ON "public"."upduo_transcripts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own values acknowledgment" ON "public"."values_acknowledgment" FOR INSERT WITH CHECK ((("id" = "public"."get_current_user_id"()) OR "public"."is_current_user_admin"()));



CREATE POLICY "Users can leave communities" ON "public"."community_members" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own community membership" ON "public"."community_members" USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text"))))));



CREATE POLICY "Users can manage own pacing preferences" ON "public"."user_pacing_preferences" USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text"))))));



CREATE POLICY "Users can manage own values acknowledgment" ON "public"."values_acknowledgment" USING ((("auth"."uid"() = "id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text"))))));



CREATE POLICY "Users can manage their own community memberships" ON "public"."community_members" TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own pacing preferences" ON "public"."user_pacing_preferences" TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own transcripts" ON "public"."upduo_transcripts" TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own values acknowledgment" ON "public"."values_acknowledgment" TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can only view and insert their own acknowledgment" ON "public"."values_acknowledgment" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can read messages for their matches" ON "public"."match_scheduling_messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."matches"
  WHERE (("matches"."id" = "match_scheduling_messages"."match_id") AND (("matches"."user1_id" = "auth"."uid"()) OR ("matches"."user2_id" = "auth"."uid"()))))));



CREATE POLICY "Users can read own pacing preferences" ON "public"."user_pacing_preferences" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own beta status" ON "public"."beta_users" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own transcripts" ON "public"."upduo_transcripts" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can save items" ON "public"."saved_items" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can save microtranslations" ON "public"."saved_items" FOR INSERT TO "authenticated" WITH CHECK (("type" = 'microtranslation'::"public"."saved_item_type"));



CREATE POLICY "Users can send match messages" ON "public"."match_scheduling_messages" FOR INSERT WITH CHECK ((("auth"."uid"() = "sender_id") AND ("auth"."uid"() IN ( SELECT "matches"."user1_id"
   FROM "public"."matches"
  WHERE ("matches"."id" = "match_scheduling_messages"."match_id")
UNION
 SELECT "matches"."user2_id"
   FROM "public"."matches"
  WHERE ("matches"."id" = "match_scheduling_messages"."match_id")))));



CREATE POLICY "Users can send messages to their matches" ON "public"."match_scheduling_messages" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."matches"
  WHERE (("matches"."id" = "match_scheduling_messages"."match_id") AND (("matches"."user1_id" = "auth"."uid"()) OR ("matches"."user2_id" = "auth"."uid"())) AND ("matches"."status" = 'active'::"text")))) AND ("sender_id" = "auth"."uid"())));



CREATE POLICY "Users can update own comments" ON "public"."comments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own posts" ON "public"."posts" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own availability" ON "public"."user_availability" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own custom tools" ON "public"."user_custom_tools" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own engagement stats" ON "public"."engagement_stats" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own hat detections" ON "public"."hat_detections" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own match notes" ON "public"."match_user_notes" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own pacing preferences" ON "public"."user_pacing_preferences" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own saved items" ON "public"."saved_items" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own schedules" ON "public"."user_session_schedules" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own scheduling messages" ON "public"."match_scheduling_messages" FOR UPDATE USING (("auth"."uid"() = "sender_id"));



CREATE POLICY "Users can view match partner profiles" ON "public"."profiles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."matches" "m"
  WHERE ((("m"."user1_id" = "auth"."uid"()) AND ("m"."user2_id" = "profiles"."id")) OR (("m"."user2_id" = "auth"."uid"()) AND ("m"."user1_id" = "profiles"."id"))))));



CREATE POLICY "Users can view messages from their matches" ON "public"."match_scheduling_messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."matches"
  WHERE (("matches"."id" = "match_scheduling_messages"."match_id") AND (("matches"."user1_id" = "auth"."uid"()) OR ("matches"."user2_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view posts from community members" ON "public"."posts" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM ("public"."community_members" "cm1"
     JOIN "public"."community_members" "cm2" ON (("cm1"."community_id" = "cm2"."community_id")))
  WHERE (("cm1"."user_id" = "auth"."uid"()) AND ("cm2"."user_id" = "posts"."user_id")))) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "Users can view roles in their communities" ON "public"."user_roles" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."community_members" "cm"
  WHERE (("cm"."community_id" = "user_roles"."community_id") AND ("cm"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their assigned tools" ON "public"."user_tools" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR (("auth"."jwt"() ->> 'email'::"text") ~~ '%@sideby.ai'::"text")));



CREATE POLICY "Users can view their match messages" ON "public"."match_scheduling_messages" FOR SELECT USING (("auth"."uid"() IN ( SELECT "matches"."user1_id"
   FROM "public"."matches"
  WHERE ("matches"."id" = "match_scheduling_messages"."match_id")
UNION
 SELECT "matches"."user2_id"
   FROM "public"."matches"
  WHERE ("matches"."id" = "match_scheduling_messages"."match_id"))));



CREATE POLICY "Users can view their own acknowledgment" ON "public"."values_acknowledgment" FOR SELECT USING ((("auth"."uid"() = "id") OR "public"."is_current_user_admin"()));



CREATE POLICY "Users can view their own availability" ON "public"."user_availability" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own community memberships" ON "public"."community_members" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own custom tools" ON "public"."user_custom_tools" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own engagement logs" ON "public"."engagement_logs" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own engagement stats" ON "public"."engagement_stats" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own enhanced analysis" ON "public"."enhanced_transcript_analysis" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own experiments" ON "public"."profile_experiments" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own flow activities" ON "public"."user_flow_activities" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own hat detections" ON "public"."hat_detections" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own match notes" ON "public"."match_user_notes" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own matches" ON "public"."matches" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user1_id") OR ("auth"."uid"() = "user2_id")));



CREATE POLICY "Users can view their own meeting times" ON "public"."match_meeting_times" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."matches" "m"
  WHERE (("m"."id" = "match_meeting_times"."match_id") AND (("m"."user1_id" = "auth"."uid"()) OR ("m"."user2_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view their own memberships" ON "public"."community_members" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own notification delivery logs" ON "public"."notification_delivery_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."notifications" "n"
  WHERE (("n"."id" = "notification_delivery_logs"."notification_id") AND ("n"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own notification logs" ON "public"."notification_delivery_logs" FOR SELECT USING (((("source_table" = 'notifications'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."notifications" "n"
  WHERE (("n"."id" = "notification_delivery_logs"."notification_id") AND ("n"."user_id" = "auth"."uid"()))))) OR (("source_table" = 'pending_notifications'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."pending_notifications" "pn"
  WHERE (("pn"."id" = "notification_delivery_logs"."notification_id") AND ("pn"."user_id" = "auth"."uid"()))))) OR (("source_table" = 'system'::"text") AND ("notification_id" = '00000000-0000-0000-0000-000000000000'::"uuid"))));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own pacing preferences" ON "public"."user_pacing_preferences" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own saved items" ON "public"."saved_items" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."email" ~~ '%@sideby.ai'::"text"))))));



CREATE POLICY "Users can view their own schedules" ON "public"."user_session_schedules" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own sponsorships" ON "public"."sponsorships" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own transcripts" ON "public"."upduo_transcripts" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own values acknowledgment" ON "public"."values_acknowledgment" FOR SELECT USING ((("id" = "public"."get_current_user_id"()) OR "public"."is_current_user_admin"()));



CREATE POLICY "View matches" ON "public"."matches" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))) OR ("auth"."uid"() = "user1_id") OR ("auth"."uid"() = "user2_id")));



ALTER TABLE "public"."admin_alerts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_manage_beta_users" ON "public"."beta_users" TO "authenticated" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "admin_manage_pending_emails" ON "public"."beta_user_pending_emails" TO "authenticated" USING ("public"."is_admin"("auth"."uid"()));



ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admins can insert posts for users" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_sideby_admin"("auth"."uid"()) OR ("auth"."uid"() = "user_id")));



ALTER TABLE "public"."beta_user_pending_emails" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."beta_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."communities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_feature_flags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_pacing" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."crew_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."crews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."engagement_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."engagement_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."enhanced_transcript_analysis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."global_feature_flags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hat_detections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hat_embeddings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hat_similarity_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."journey_reminder_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."journey_reminder_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."journey_stage_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match_admin_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match_conversation_analysis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match_meeting_times" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match_scheduling_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match_user_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_delivery_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notifications_insert_own" ON "public"."notifications" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "notifications_select_own" ON "public"."notifications" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "notifications_update_own" ON "public"."notifications" FOR UPDATE USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."pending_match_announcements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pending_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_visibility" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."process_gaps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_experiments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."security_audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sponsorships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."upduo_session_schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."upduo_transcripts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."upduo_user_associations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."upduo_user_mappings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_availability" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_custom_tools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_flow_activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_pacing_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_session_schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_tools" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users can view their own posts and posts they're mentioned in" ON "public"."posts" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR "public"."is_sideby_admin"("auth"."uid"())));



ALTER TABLE "public"."values_acknowledgment" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "values_acknowledgment_insert_own" ON "public"."values_acknowledgment" FOR INSERT WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "values_acknowledgment_select_own" ON "public"."values_acknowledgment" FOR SELECT USING (("id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."match_admin_messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."match_scheduling_messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."matches";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."profiles";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."saved_items";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT USAGE ON SCHEMA "testing" TO "anon";
GRANT USAGE ON SCHEMA "testing" TO "authenticated";
GRANT USAGE ON SCHEMA "testing" TO "service_role";



GRANT ALL ON TYPE "public"."app_role" TO "authenticated";
GRANT ALL ON TYPE "public"."app_role" TO "anon";



GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "service_role";


































































































































































































































































GRANT ALL ON FUNCTION "public"."accept_hat_detection"("p_detection_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_hat_detection"("p_detection_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_hat_detection"("p_detection_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_add_beta_user"("user_id" "uuid", "features_array" "public"."beta_feature"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_add_beta_user"("user_id" "uuid", "features_array" "public"."beta_feature"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_add_beta_user"("user_id" "uuid", "features_array" "public"."beta_feature"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_pre_enroll_beta_user"("email_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_pre_enroll_beta_user"("email_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_pre_enroll_beta_user"("email_address" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_remove_beta_user"("beta_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_remove_beta_user"("beta_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_remove_beta_user"("beta_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_remove_pending_beta_email"("email_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_remove_pending_beta_email"("email_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_remove_pending_beta_email"("email_address" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_sensitive_operations"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_sensitive_operations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_sensitive_operations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auth_user_is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."auth_user_is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auth_user_is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_enroll_beta_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_enroll_beta_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_enroll_beta_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_complete_matches"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_complete_matches"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_complete_matches"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_column_exists"("table_name" "text", "column_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_column_exists"("table_name" "text", "column_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_column_exists"("table_name" "text", "column_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_user_deletion_safety"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_deletion_safety"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_deletion_safety"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."clean_test_schema"() TO "anon";
GRANT ALL ON FUNCTION "public"."clean_test_schema"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."clean_test_schema"() TO "service_role";



GRANT ALL ON FUNCTION "public"."completely_delete_match"("match_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."completely_delete_match"("match_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."completely_delete_match"("match_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."count_user_matches"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."count_user_matches"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."count_user_matches"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_hat_detection"("p_user_id" "uuid", "p_hat_name" "text", "p_source" "text", "p_confidence" double precision, "p_session_id" "text", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_hat_detection"("p_user_id" "uuid", "p_hat_name" "text", "p_source" "text", "p_confidence" double precision, "p_session_id" "text", "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_hat_detection"("p_user_id" "uuid", "p_hat_name" "text", "p_source" "text", "p_confidence" double precision, "p_session_id" "text", "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification_entry"("p_receiver_id" "uuid", "p_sender_id" "uuid", "p_message_content" "text", "p_match_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification_entry"("p_receiver_id" "uuid", "p_sender_id" "uuid", "p_message_content" "text", "p_match_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification_entry"("p_receiver_id" "uuid", "p_sender_id" "uuid", "p_message_content" "text", "p_match_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."debug_admin_check"() TO "anon";
GRANT ALL ON FUNCTION "public"."debug_admin_check"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."debug_admin_check"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user_account"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_account"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_account"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_match_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_match_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_match_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_user_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_community_members"("community_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_community_members"("community_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_community_members"("community_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_email_template_with_account"("template_key_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_email_template_with_account"("template_key_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_email_template_with_account"("template_key_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_email_template_with_account_safe"("template_key_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_email_template_with_account_safe"("template_key_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_email_template_with_account_safe"("template_key_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_data"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_data"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_data"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_last_signin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_last_signin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_last_signin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_notification_preferences"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_notification_preferences"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_notification_preferences"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_weekly_session_counts"("start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_weekly_session_counts"("start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_weekly_session_counts"("start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_admin_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_admin_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_admin_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_match_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_match_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_match_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_admin_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_admin_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_admin_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_chat_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_chat_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_chat_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_match_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_match_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_match_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_notification_request"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_notification_request"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_notification_request"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_profile_deletion"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_profile_deletion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_profile_deletion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_posts_deletion"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_posts_deletion"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_posts_deletion"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."hard_delete_user_account"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."hard_delete_user_account"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hard_delete_user_account"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_beta_feature"("user_uuid" "uuid", "feature_name" "public"."beta_feature") TO "anon";
GRANT ALL ON FUNCTION "public"."has_beta_feature"("user_uuid" "uuid", "feature_name" "public"."beta_feature") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_beta_feature"("user_uuid" "uuid", "feature_name" "public"."beta_feature") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_community_role"("user_id" "uuid", "community_id" "uuid", "role" "public"."app_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_community_role"("user_id" "uuid", "community_id" "uuid", "role" "public"."app_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_community_role"("user_id" "uuid", "community_id" "uuid", "role" "public"."app_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_current_user_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_current_user_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_current_user_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_phone_verified"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_phone_verified"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_phone_verified"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_post_visible_to_user"("post_id" "uuid", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_post_visible_to_user"("post_id" "uuid", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_post_visible_to_user"("post_id" "uuid", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_production_environment"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_production_environment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_production_environment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_sideby_admin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_sideby_admin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_sideby_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_sideby_admin_from_profile"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_sideby_admin_from_profile"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_sideby_admin_from_profile"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_journey_stage_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_journey_stage_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_journey_stage_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reject_hat_detection"("p_detection_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."reject_hat_detection"("p_detection_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reject_hat_detection"("p_detection_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_user_from_sideby"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."remove_user_from_sideby"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_user_from_sideby"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_user_from_sideby_improved"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."remove_user_from_sideby_improved"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_user_from_sideby_improved"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at_for_hat_metadata"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at_for_hat_metadata"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at_for_hat_metadata"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at_for_logs"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at_for_logs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at_for_logs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at_for_notifications"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at_for_notifications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at_for_notifications"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at_for_upduo_mappings"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at_for_upduo_mappings"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at_for_upduo_mappings"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at_trigger_for_visibility"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at_trigger_for_visibility"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at_trigger_for_visibility"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_user_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_user_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_user_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."track_journey_stage_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."track_journey_stage_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_journey_stage_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_journey_monitor"("force_run" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_journey_monitor"("force_run" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_journey_monitor"("force_run" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_notification_digest"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_notification_digest"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_notification_digest"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_crews_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_crews_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_crews_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_enhanced_analysis_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_enhanced_analysis_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_enhanced_analysis_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."use_schema"("schema_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."use_schema"("schema_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."use_schema"("schema_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."user_exists"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_exists"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_exists"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_admin_operation"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_admin_operation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_admin_operation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "service_role";
























GRANT ALL ON TABLE "public"."admin_alerts" TO "anon";
GRANT ALL ON TABLE "public"."admin_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_alerts" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."admin_notification_metrics" TO "anon";
GRANT ALL ON TABLE "public"."admin_notification_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_notification_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_availability" TO "anon";
GRANT ALL ON TABLE "public"."user_availability" TO "authenticated";
GRANT ALL ON TABLE "public"."user_availability" TO "service_role";



GRANT ALL ON TABLE "public"."admin_user_availability_view" TO "anon";
GRANT ALL ON TABLE "public"."admin_user_availability_view" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_user_availability_view" TO "service_role";



GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."beta_user_pending_emails" TO "anon";
GRANT ALL ON TABLE "public"."beta_user_pending_emails" TO "authenticated";
GRANT ALL ON TABLE "public"."beta_user_pending_emails" TO "service_role";



GRANT ALL ON TABLE "public"."beta_users" TO "anon";
GRANT ALL ON TABLE "public"."beta_users" TO "authenticated";
GRANT ALL ON TABLE "public"."beta_users" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."communities" TO "anon";
GRANT ALL ON TABLE "public"."communities" TO "authenticated";
GRANT ALL ON TABLE "public"."communities" TO "service_role";



GRANT ALL ON TABLE "public"."community_feature_flags" TO "anon";
GRANT ALL ON TABLE "public"."community_feature_flags" TO "authenticated";
GRANT ALL ON TABLE "public"."community_feature_flags" TO "service_role";



GRANT ALL ON TABLE "public"."community_members" TO "anon";
GRANT ALL ON TABLE "public"."community_members" TO "authenticated";
GRANT ALL ON TABLE "public"."community_members" TO "service_role";



GRANT ALL ON TABLE "public"."community_pacing" TO "anon";
GRANT ALL ON TABLE "public"."community_pacing" TO "authenticated";
GRANT ALL ON TABLE "public"."community_pacing" TO "service_role";



GRANT ALL ON TABLE "public"."crew_members" TO "anon";
GRANT ALL ON TABLE "public"."crew_members" TO "authenticated";
GRANT ALL ON TABLE "public"."crew_members" TO "service_role";



GRANT ALL ON TABLE "public"."crews" TO "anon";
GRANT ALL ON TABLE "public"."crews" TO "authenticated";
GRANT ALL ON TABLE "public"."crews" TO "service_role";



GRANT ALL ON TABLE "public"."engagement_logs" TO "anon";
GRANT ALL ON TABLE "public"."engagement_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."engagement_logs" TO "service_role";



GRANT ALL ON TABLE "public"."engagement_stats" TO "anon";
GRANT ALL ON TABLE "public"."engagement_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."engagement_stats" TO "service_role";



GRANT ALL ON TABLE "public"."enhanced_transcript_analysis" TO "anon";
GRANT ALL ON TABLE "public"."enhanced_transcript_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."enhanced_transcript_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."global_feature_flags" TO "anon";
GRANT ALL ON TABLE "public"."global_feature_flags" TO "authenticated";
GRANT ALL ON TABLE "public"."global_feature_flags" TO "service_role";



GRANT ALL ON TABLE "public"."hat_detections" TO "anon";
GRANT ALL ON TABLE "public"."hat_detections" TO "authenticated";
GRANT ALL ON TABLE "public"."hat_detections" TO "service_role";



GRANT ALL ON TABLE "public"."hat_embeddings" TO "anon";
GRANT ALL ON TABLE "public"."hat_embeddings" TO "authenticated";
GRANT ALL ON TABLE "public"."hat_embeddings" TO "service_role";



GRANT ALL ON TABLE "public"."hat_inference_requests" TO "anon";
GRANT ALL ON TABLE "public"."hat_inference_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."hat_inference_requests" TO "service_role";



GRANT ALL ON TABLE "public"."hat_metadata" TO "anon";
GRANT ALL ON TABLE "public"."hat_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."hat_metadata" TO "service_role";



GRANT ALL ON TABLE "public"."hat_similarity_cache" TO "anon";
GRANT ALL ON TABLE "public"."hat_similarity_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."hat_similarity_cache" TO "service_role";



GRANT ALL ON TABLE "public"."journey_reminder_logs" TO "anon";
GRANT ALL ON TABLE "public"."journey_reminder_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."journey_reminder_logs" TO "service_role";



GRANT ALL ON TABLE "public"."journey_reminder_templates" TO "anon";
GRANT ALL ON TABLE "public"."journey_reminder_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."journey_reminder_templates" TO "service_role";



GRANT ALL ON TABLE "public"."journey_stage_config" TO "anon";
GRANT ALL ON TABLE "public"."journey_stage_config" TO "authenticated";
GRANT ALL ON TABLE "public"."journey_stage_config" TO "service_role";



GRANT ALL ON TABLE "public"."match_admin_messages" TO "anon";
GRANT ALL ON TABLE "public"."match_admin_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."match_admin_messages" TO "service_role";



GRANT ALL ON TABLE "public"."match_conversation_analysis" TO "anon";
GRANT ALL ON TABLE "public"."match_conversation_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."match_conversation_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."match_meeting_times" TO "anon";
GRANT ALL ON TABLE "public"."match_meeting_times" TO "authenticated";
GRANT ALL ON TABLE "public"."match_meeting_times" TO "service_role";



GRANT ALL ON TABLE "public"."match_scheduling_messages" TO "anon";
GRANT ALL ON TABLE "public"."match_scheduling_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."match_scheduling_messages" TO "service_role";



GRANT ALL ON TABLE "public"."match_user_notes" TO "anon";
GRANT ALL ON TABLE "public"."match_user_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."match_user_notes" TO "service_role";



GRANT ALL ON TABLE "public"."matches" TO "anon";
GRANT ALL ON TABLE "public"."matches" TO "authenticated";
GRANT ALL ON TABLE "public"."matches" TO "service_role";



GRANT ALL ON TABLE "public"."notification_delivery_logs" TO "anon";
GRANT ALL ON TABLE "public"."notification_delivery_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_delivery_logs" TO "service_role";



GRANT ALL ON TABLE "public"."pending_match_announcements" TO "anon";
GRANT ALL ON TABLE "public"."pending_match_announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_match_announcements" TO "service_role";



GRANT ALL ON TABLE "public"."pending_notifications" TO "anon";
GRANT ALL ON TABLE "public"."pending_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."post_visibility" TO "anon";
GRANT ALL ON TABLE "public"."post_visibility" TO "authenticated";
GRANT ALL ON TABLE "public"."post_visibility" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."process_gaps" TO "anon";
GRANT ALL ON TABLE "public"."process_gaps" TO "authenticated";
GRANT ALL ON TABLE "public"."process_gaps" TO "service_role";



GRANT ALL ON TABLE "public"."profile_experiments" TO "anon";
GRANT ALL ON TABLE "public"."profile_experiments" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_experiments" TO "service_role";



GRANT ALL ON TABLE "public"."saved_items" TO "anon";
GRANT ALL ON TABLE "public"."saved_items" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_items" TO "service_role";



GRANT ALL ON TABLE "public"."security_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."security_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."security_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."sponsorships" TO "anon";
GRANT ALL ON TABLE "public"."sponsorships" TO "authenticated";
GRANT ALL ON TABLE "public"."sponsorships" TO "service_role";



GRANT ALL ON TABLE "public"."tools" TO "anon";
GRANT ALL ON TABLE "public"."tools" TO "authenticated";
GRANT ALL ON TABLE "public"."tools" TO "service_role";



GRANT ALL ON TABLE "public"."upduo_session_schedules" TO "anon";
GRANT ALL ON TABLE "public"."upduo_session_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."upduo_session_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."upduo_transcripts" TO "anon";
GRANT ALL ON TABLE "public"."upduo_transcripts" TO "authenticated";
GRANT ALL ON TABLE "public"."upduo_transcripts" TO "service_role";



GRANT ALL ON TABLE "public"."upduo_user_associations" TO "anon";
GRANT ALL ON TABLE "public"."upduo_user_associations" TO "authenticated";
GRANT ALL ON TABLE "public"."upduo_user_associations" TO "service_role";



GRANT ALL ON TABLE "public"."upduo_user_mappings" TO "anon";
GRANT ALL ON TABLE "public"."upduo_user_mappings" TO "authenticated";
GRANT ALL ON TABLE "public"."upduo_user_mappings" TO "service_role";



GRANT ALL ON TABLE "public"."user_custom_tools" TO "anon";
GRANT ALL ON TABLE "public"."user_custom_tools" TO "authenticated";
GRANT ALL ON TABLE "public"."user_custom_tools" TO "service_role";



GRANT ALL ON TABLE "public"."user_flow_activities" TO "anon";
GRANT ALL ON TABLE "public"."user_flow_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."user_flow_activities" TO "service_role";



GRANT ALL ON TABLE "public"."user_journey_events" TO "anon";
GRANT ALL ON TABLE "public"."user_journey_events" TO "authenticated";
GRANT ALL ON TABLE "public"."user_journey_events" TO "service_role";



GRANT ALL ON TABLE "public"."user_pacing_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_pacing_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_pacing_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_pacing_preferences_with_names" TO "anon";
GRANT ALL ON TABLE "public"."user_pacing_preferences_with_names" TO "authenticated";
GRANT ALL ON TABLE "public"."user_pacing_preferences_with_names" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_session_schedules" TO "anon";
GRANT ALL ON TABLE "public"."user_session_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."user_session_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."user_tools" TO "anon";
GRANT ALL ON TABLE "public"."user_tools" TO "authenticated";
GRANT ALL ON TABLE "public"."user_tools" TO "service_role";



GRANT ALL ON TABLE "public"."values_acknowledgment" TO "anon";
GRANT ALL ON TABLE "public"."values_acknowledgment" TO "authenticated";
GRANT ALL ON TABLE "public"."values_acknowledgment" TO "service_role";



GRANT ALL ON TABLE "testing"."admin_users" TO "anon";
GRANT ALL ON TABLE "testing"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "testing"."admin_users" TO "service_role";



GRANT ALL ON TABLE "testing"."comments" TO "anon";
GRANT ALL ON TABLE "testing"."comments" TO "authenticated";
GRANT ALL ON TABLE "testing"."comments" TO "service_role";



GRANT ALL ON TABLE "testing"."communities" TO "anon";
GRANT ALL ON TABLE "testing"."communities" TO "authenticated";
GRANT ALL ON TABLE "testing"."communities" TO "service_role";



GRANT ALL ON TABLE "testing"."community_members" TO "anon";
GRANT ALL ON TABLE "testing"."community_members" TO "authenticated";
GRANT ALL ON TABLE "testing"."community_members" TO "service_role";



GRANT ALL ON TABLE "testing"."community_pacing" TO "anon";
GRANT ALL ON TABLE "testing"."community_pacing" TO "authenticated";
GRANT ALL ON TABLE "testing"."community_pacing" TO "service_role";



GRANT ALL ON TABLE "testing"."connections" TO "anon";
GRANT ALL ON TABLE "testing"."connections" TO "authenticated";
GRANT ALL ON TABLE "testing"."connections" TO "service_role";



GRANT ALL ON TABLE "testing"."engagement_logs" TO "anon";
GRANT ALL ON TABLE "testing"."engagement_logs" TO "authenticated";
GRANT ALL ON TABLE "testing"."engagement_logs" TO "service_role";



GRANT ALL ON TABLE "testing"."match_scheduling_messages" TO "anon";
GRANT ALL ON TABLE "testing"."match_scheduling_messages" TO "authenticated";
GRANT ALL ON TABLE "testing"."match_scheduling_messages" TO "service_role";



GRANT ALL ON TABLE "testing"."matches" TO "anon";
GRANT ALL ON TABLE "testing"."matches" TO "authenticated";
GRANT ALL ON TABLE "testing"."matches" TO "service_role";



GRANT ALL ON TABLE "testing"."posts" TO "anon";
GRANT ALL ON TABLE "testing"."posts" TO "authenticated";
GRANT ALL ON TABLE "testing"."posts" TO "service_role";



GRANT ALL ON TABLE "testing"."process_gaps" TO "anon";
GRANT ALL ON TABLE "testing"."process_gaps" TO "authenticated";
GRANT ALL ON TABLE "testing"."process_gaps" TO "service_role";



GRANT ALL ON TABLE "testing"."profiles" TO "anon";
GRANT ALL ON TABLE "testing"."profiles" TO "authenticated";
GRANT ALL ON TABLE "testing"."profiles" TO "service_role";



GRANT ALL ON TABLE "testing"."resources" TO "anon";
GRANT ALL ON TABLE "testing"."resources" TO "authenticated";
GRANT ALL ON TABLE "testing"."resources" TO "service_role";



GRANT ALL ON TABLE "testing"."saved_items" TO "anon";
GRANT ALL ON TABLE "testing"."saved_items" TO "authenticated";
GRANT ALL ON TABLE "testing"."saved_items" TO "service_role";



GRANT ALL ON TABLE "testing"."sponsorships" TO "anon";
GRANT ALL ON TABLE "testing"."sponsorships" TO "authenticated";
GRANT ALL ON TABLE "testing"."sponsorships" TO "service_role";



GRANT ALL ON TABLE "testing"."tools" TO "anon";
GRANT ALL ON TABLE "testing"."tools" TO "authenticated";
GRANT ALL ON TABLE "testing"."tools" TO "service_role";



GRANT ALL ON TABLE "testing"."upduo_session_schedules" TO "anon";
GRANT ALL ON TABLE "testing"."upduo_session_schedules" TO "authenticated";
GRANT ALL ON TABLE "testing"."upduo_session_schedules" TO "service_role";



GRANT ALL ON TABLE "testing"."user_pacing_preferences" TO "anon";
GRANT ALL ON TABLE "testing"."user_pacing_preferences" TO "authenticated";
GRANT ALL ON TABLE "testing"."user_pacing_preferences" TO "service_role";



GRANT ALL ON TABLE "testing"."user_roles" TO "anon";
GRANT ALL ON TABLE "testing"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "testing"."user_roles" TO "service_role";



GRANT ALL ON TABLE "testing"."user_session_schedules" TO "anon";
GRANT ALL ON TABLE "testing"."user_session_schedules" TO "authenticated";
GRANT ALL ON TABLE "testing"."user_session_schedules" TO "service_role";



GRANT ALL ON TABLE "testing"."user_tools" TO "anon";
GRANT ALL ON TABLE "testing"."user_tools" TO "authenticated";
GRANT ALL ON TABLE "testing"."user_tools" TO "service_role";



GRANT ALL ON TABLE "testing"."values_acknowledgment" TO "anon";
GRANT ALL ON TABLE "testing"."values_acknowledgment" TO "authenticated";
GRANT ALL ON TABLE "testing"."values_acknowledgment" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
