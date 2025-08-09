-- Create function to upsert engagement stats
CREATE OR REPLACE FUNCTION public.upsert_engagement_stats(
  p_user_id UUID,
  p_community_id UUID,
  p_engagement_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_types TEXT[] := ARRAY['upduo_intro_completed', 'upduo_download_completed', 'session_completed', 'learning_session_completed'];
  current_date DATE := CURRENT_DATE;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
  has_yesterday_engagement BOOLEAN;
  current_streak_count INTEGER := 0;
BEGIN
  -- Check if this engagement type counts as a completed session
  IF p_engagement_type = ANY(session_types) THEN
    -- Calculate current streak
    -- Check if user had engagement yesterday
    SELECT EXISTS(
      SELECT 1 FROM engagement_logs 
      WHERE user_id = p_user_id 
        AND community_id = p_community_id 
        AND DATE(created_at) = yesterday_date
        AND engagement_type = ANY(session_types)
    ) INTO has_yesterday_engagement;
    
    -- Get current streak or start new one
    IF has_yesterday_engagement THEN
      SELECT COALESCE(current_streak, 0) + 1 
      FROM engagement_stats 
      WHERE user_id = p_user_id AND community_id = p_community_id
      INTO current_streak_count;
    ELSE
      current_streak_count := 1;
    END IF;
    
    -- Upsert engagement stats
    INSERT INTO public.engagement_stats (
      user_id,
      community_id,
      completed_sessions,
      current_streak,
      last_engagement_date,
      created_at,
      updated_at
    )
    VALUES (
      p_user_id,
      p_community_id,
      1,
      current_streak_count,
      current_date,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, community_id)
    DO UPDATE SET
      completed_sessions = engagement_stats.completed_sessions + 1,
      current_streak = current_streak_count,
      last_engagement_date = current_date,
      updated_at = NOW();
  ELSE
    -- For non-session engagement types, just update last engagement date
    INSERT INTO public.engagement_stats (
      user_id,
      community_id,
      completed_sessions,
      current_streak,
      last_engagement_date,
      created_at,
      updated_at
    )
    VALUES (
      p_user_id,
      p_community_id,
      0,
      0,
      current_date,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, community_id)
    DO UPDATE SET
      last_engagement_date = GREATEST(engagement_stats.last_engagement_date, current_date),
      updated_at = NOW();
  END IF;
END;
$$;

-- Create trigger function for engagement logs
CREATE OR REPLACE FUNCTION public.update_engagement_stats_on_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the upsert function with the new engagement log data
  PERFORM public.upsert_engagement_stats(
    NEW.user_id,
    NEW.community_id,
    NEW.engagement_type
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on engagement_logs table
DROP TRIGGER IF EXISTS trigger_update_engagement_stats ON public.engagement_logs;
CREATE TRIGGER trigger_update_engagement_stats
  AFTER INSERT ON public.engagement_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_engagement_stats_on_log();

-- Backfill historical engagement stats data
DO $$
DECLARE
  log_record RECORD;
  session_types TEXT[] := ARRAY['upduo_intro_completed', 'upduo_download_completed', 'session_completed', 'learning_session_completed'];
BEGIN
  -- Clear existing stats to rebuild from scratch
  DELETE FROM public.engagement_stats;
  
  -- Process each engagement log in chronological order
  FOR log_record IN 
    SELECT user_id, community_id, engagement_type, created_at
    FROM public.engagement_logs 
    ORDER BY created_at ASC
  LOOP
    -- Process each log through our upsert function
    PERFORM public.upsert_engagement_stats(
      log_record.user_id,
      log_record.community_id,
      log_record.engagement_type
    );
  END LOOP;
  
  RAISE NOTICE 'Engagement stats backfill completed. Processed % logs.', 
    (SELECT COUNT(*) FROM public.engagement_logs);
END;
$$;