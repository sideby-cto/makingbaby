-- Update Monique Cabellon's reflection status
-- Setting has_completed_reflection to true based on admin request

UPDATE profiles 
SET 
  has_completed_reflection = true,
  has_partial_reflection = false,
  journey_stage = CASE 
    WHEN journey_stage IN ('getting_started', 'profile_setup', 'first_session_complete') 
    THEN 'awaiting_match'
    ELSE journey_stage
  END,
  updated_at = now()
WHERE email = 'mcabellon@psesd.org'
  AND has_completed_reflection = false;

-- Verify the update
SELECT 
  email,
  first_name,
  last_name,
  has_completed_reflection,
  has_partial_reflection,
  journey_stage,
  updated_at
FROM profiles 
WHERE email = 'mcabellon@psesd.org';