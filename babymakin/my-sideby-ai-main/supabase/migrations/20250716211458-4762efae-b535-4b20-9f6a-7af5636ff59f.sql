-- Update profiles.onboarding_completed flag for users who have completed all onboarding steps
-- This ensures database consistency and prevents race conditions

UPDATE profiles 
SET onboarding_completed = true
WHERE onboarding_completed = false 
AND id IN (
  SELECT DISTINCT p.id 
  FROM profiles p
  WHERE EXISTS (
    SELECT 1 FROM values_acknowledgment va WHERE va.id = p.id
  )
  AND EXISTS (
    SELECT 1 FROM community_members cm WHERE cm.user_id = p.id
  )
  AND EXISTS (
    SELECT 1 FROM user_pacing_preferences upp WHERE upp.user_id = p.id
  )
  AND p.phone_number IS NOT NULL
  AND p.onboarding_completed = false
);

-- Add an index on onboarding_completed for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON profiles(onboarding_completed) 
WHERE onboarding_completed = true;