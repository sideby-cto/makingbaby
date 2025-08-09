
-- Update Amanda Daniels' reflection status based on confirmed Upduo session data
-- Amanda has a substantive reflection session (701 words, quality score 50)

UPDATE profiles 
SET 
  has_completed_reflection = true,
  has_partial_reflection = false,
  reflection_quality_score = 50,
  journey_stage = 'awaiting_match',
  updated_at = now()
WHERE email = 'amanda.daniels@example.com'
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
        'quality_score', 50,
        'session_word_count', 701,
        'update_reason', 'Amanda has substantive reflection content - confirmed via Upduo transcript analysis'
    ) as event_data,
    now() as created_at
FROM profiles
WHERE email = 'amanda.daniels@example.com'
  AND has_completed_reflection = true;

-- Verify the update
SELECT 
  email,
  has_completed_reflection,
  has_partial_reflection,
  reflection_quality_score,
  journey_stage,
  updated_at
FROM profiles 
WHERE email = 'amanda.daniels@example.com';
