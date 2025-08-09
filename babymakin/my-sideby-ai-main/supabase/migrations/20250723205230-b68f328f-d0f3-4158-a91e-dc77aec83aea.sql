-- Update reflection status for Greg Geraldo and Amanda V
-- Setting has_completed_reflection to true based on admin request

UPDATE profiles 
SET 
  has_completed_reflection = true,
  has_partial_reflection = false,
  reflection_quality_score = 75,
  updated_at = now()
WHERE (first_name = 'Greg' AND last_name = 'Geraldo')
   OR (first_name = 'Amanda' AND last_name = 'V');

-- Verify the updates
SELECT 
  first_name,
  last_name,
  email,
  has_completed_reflection,
  has_partial_reflection,
  reflection_quality_score,
  updated_at
FROM profiles 
WHERE (first_name = 'Greg' AND last_name = 'Geraldo')
   OR (first_name = 'Amanda' AND last_name = 'V');