
-- Add journey_stage column to profiles table
ALTER TABLE public.profiles
ADD COLUMN journey_stage text NOT NULL DEFAULT 'new';

-- Create a function to keep journey_stage in sync with user_journey_events
CREATE OR REPLACE FUNCTION public.sync_journey_stage()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the profile's journey_stage when a new journey event is created
  UPDATE public.profiles
  SET journey_stage = NEW.new_stage
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Drop the trigger if it already exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE t.tgname = 'sync_journey_stage_on_event'
      AND c.relname = 'user_journey_events'
      AND n.nspname = 'public'
  ) THEN
    DROP TRIGGER sync_journey_stage_on_event ON public.user_journey_events;
  END IF;
END;
$$;

-- Create a trigger to keep the profile's journey_stage in sync with the latest event
CREATE TRIGGER sync_journey_stage_on_event
  AFTER INSERT ON public.user_journey_events
  FOR EACH ROW EXECUTE FUNCTION public.sync_journey_stage();

-- Populate journey_stage for existing users based on their latest journey event
UPDATE public.profiles p
SET journey_stage = COALESCE(
  (SELECT new_stage 
   FROM public.user_journey_events 
   WHERE user_id = p.id 
   ORDER BY created_at DESC 
   LIMIT 1),
  CASE WHEN p.has_completed_reflection THEN 'reflection_completed' ELSE 'new' END
);
