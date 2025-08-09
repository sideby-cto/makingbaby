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

-- Log the update for audit purposes
INSERT INTO user_journey_events (user_id, event_type, event_data, created_at)
SELECT 
    id as user_id,
    'reflection_status_updated' as event_type,
    jsonb_build_object(
        'source', 'manual_admin_update',
        'updated_by', 'admin',
        'previous_status', false,
        'new_status', true,
        'update_reason', 'Admin-requested reflection status update for Monique Cabellon'
    ) as event_data,
    now() as created_at
FROM profiles
WHERE email = 'mcabellon@psesd.org'
  AND has_completed_reflection = true;

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