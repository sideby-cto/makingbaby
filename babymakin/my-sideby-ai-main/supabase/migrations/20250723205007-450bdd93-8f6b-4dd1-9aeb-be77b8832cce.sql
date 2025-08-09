-- Update reflection status for Greg Geraldo and Amanda V
-- Setting has_completed_reflection to true based on admin request

UPDATE profiles 
SET 
  has_completed_reflection = true,
  has_partial_reflection = false,
  reflection_quality_score = 75,
  updated_at = now()
WHERE (first_name = 'Greg' AND last_name = 'Geraldo')
   OR (first_name = 'Amanda' AND last_name = 'V')
   AND has_completed_reflection = false;

-- Log the updates for audit purposes
INSERT INTO user_journey_events (user_id, event_type, event_data, created_at)
SELECT 
    id as user_id,
    'reflection_status_updated' as event_type,
    jsonb_build_object(
        'source', 'manual_admin_update',
        'updated_by', 'admin',
        'previous_status', false,
        'new_status', true,
        'quality_score', 75,
        'update_reason', 'Admin-requested reflection status update for Greg Geraldo and Amanda V'
    ) as event_data,
    now() as created_at
FROM profiles
WHERE ((first_name = 'Greg' AND last_name = 'Geraldo')
    OR (first_name = 'Amanda' AND last_name = 'V'))
  AND has_completed_reflection = true;

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