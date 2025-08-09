-- Add user_name columns to both tables
ALTER TABLE public.engagement_logs ADD COLUMN user_name TEXT;
ALTER TABLE public.engagement_stats ADD COLUMN user_name TEXT;

-- Create a function to format display names consistently with Supabase Auth
CREATE OR REPLACE FUNCTION public.format_user_display_name(
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  user_id UUID
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Match Supabase Auth display name format
  IF first_name IS NOT NULL AND last_name IS NOT NULL THEN
    RETURN trim(first_name || ' ' || last_name);
  ELSIF first_name IS NOT NULL THEN
    RETURN trim(first_name);
  ELSIF last_name IS NOT NULL THEN
    RETURN trim(last_name);
  ELSIF email IS NOT NULL THEN
    -- Extract name from email and format nicely (capitalize first letter)
    RETURN initcap(replace(split_part(email, '@', 1), '.', ' '));
  ELSE
    RETURN 'User ' || substring(user_id::text, 1, 8);
  END IF;
END;
$$;

-- Update existing records with formatted display names
UPDATE public.engagement_logs 
SET user_name = (
  SELECT public.format_user_display_name(p.first_name, p.last_name, p.email, p.id)
  FROM public.profiles p 
  WHERE p.id = engagement_logs.user_id
);

UPDATE public.engagement_stats 
SET user_name = (
  SELECT public.format_user_display_name(p.first_name, p.last_name, p.email, p.id)
  FROM public.profiles p 
  WHERE p.id = engagement_stats.user_id
);

-- Create trigger to keep user_name in sync when profiles are updated
CREATE OR REPLACE FUNCTION public.sync_engagement_user_names()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_display_name TEXT;
BEGIN
  -- Format the new display name
  new_display_name := public.format_user_display_name(
    NEW.first_name, 
    NEW.last_name, 
    NEW.email, 
    NEW.id
  );
  
  -- Update engagement_logs
  UPDATE public.engagement_logs 
  SET user_name = new_display_name
  WHERE user_id = NEW.id;
  
  -- Update engagement_stats
  UPDATE public.engagement_stats 
  SET user_name = new_display_name
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile updates
CREATE TRIGGER sync_engagement_user_names_trigger
  AFTER UPDATE OF first_name, last_name, email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_engagement_user_names();

-- Update the upsert_engagement_stats function to include user_name
CREATE OR REPLACE FUNCTION public.upsert_engagement_stats(p_user_id uuid, p_community_id uuid, p_engagement_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  session_types TEXT[] := ARRAY['upduo_intro_completed', 'upduo_download_completed', 'session_completed', 'learning_session_completed'];
  current_date DATE := CURRENT_DATE;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
  has_yesterday_engagement BOOLEAN;
  current_streak_count INTEGER := 0;
  user_display_name TEXT;
BEGIN
  -- Get user display name
  SELECT public.format_user_display_name(first_name, last_name, email, id)
  INTO user_display_name
  FROM public.profiles
  WHERE id = p_user_id;

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
      user_name,
      created_at,
      updated_at
    )
    VALUES (
      p_user_id,
      p_community_id,
      1,
      current_streak_count,
      current_date,
      user_display_name,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, community_id)
    DO UPDATE SET
      completed_sessions = engagement_stats.completed_sessions + 1,
      current_streak = current_streak_count,
      last_engagement_date = current_date,
      user_name = user_display_name,
      updated_at = NOW();
  ELSE
    -- For non-session engagement types, just update last engagement date
    INSERT INTO public.engagement_stats (
      user_id,
      community_id,
      completed_sessions,
      current_streak,
      last_engagement_date,
      user_name,
      created_at,
      updated_at
    )
    VALUES (
      p_user_id,
      p_community_id,
      0,
      0,
      current_date,
      user_display_name,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, community_id)
    DO UPDATE SET
      last_engagement_date = GREATEST(engagement_stats.last_engagement_date, current_date),
      user_name = user_display_name,
      updated_at = NOW();
  END IF;
END;
$function$;