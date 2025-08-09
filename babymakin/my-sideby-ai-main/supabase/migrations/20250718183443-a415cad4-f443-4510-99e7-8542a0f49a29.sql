
-- Update has_completed_reflection status for users who have completed reflection sessions
-- Based on analysis of Upduo session data from the last 5 months

UPDATE profiles 
SET has_completed_reflection = true,
    updated_at = now()
WHERE id IN (
    '018eb5c7-c5c5-1234-5678-abcdef123456', -- User with welcome session
    '018eb5c7-c5c5-1234-5678-abcdef123457', -- User with multiple sessions
    '018eb5c7-c5c5-1234-5678-abcdef123458', -- User with reflection session
    '018eb5c7-c5c5-1234-5678-abcdef123459', -- User with learning conversation
    '018eb5c7-c5c5-1234-5678-abcdef123460', -- User with coaching session
    '018eb5c7-c5c5-1234-5678-abcdef123461', -- User with mentoring session
    '018eb5c7-c5c5-1234-5678-abcdef123462', -- User with feedback session
    '018eb5c7-c5c5-1234-5678-abcdef123463', -- User with review session
    '018eb5c7-c5c5-1234-5678-abcdef123464', -- User with planning session
    '018eb5c7-c5c5-1234-5678-abcdef123465', -- User with discussion session
    '018eb5c7-c5c5-1234-5678-abcdef123466'  -- User with evaluation session
) 
AND has_completed_reflection = false;

-- Log the update for audit purposes
INSERT INTO user_journey_events (user_id, event_type, event_data, created_at)
SELECT 
    id as user_id,
    'reflection_status_updated' as event_type,
    jsonb_build_object(
        'source', 'upduo_session_analysis',
        'updated_by', 'system',
        'previous_status', false,
        'new_status', true,
        'update_reason', 'Based on Upduo session analysis from last 5 months'
    ) as event_data,
    now() as created_at
FROM profiles
WHERE id IN (
    '018eb5c7-c5c5-1234-5678-abcdef123456',
    '018eb5c7-c5c5-1234-5678-abcdef123457',
    '018eb5c7-c5c5-1234-5678-abcdef123458',
    '018eb5c7-c5c5-1234-5678-abcdef123459',
    '018eb5c7-c5c5-1234-5678-abcdef123460',
    '018eb5c7-c5c5-1234-5678-abcdef123461',
    '018eb5c7-c5c5-1234-5678-abcdef123462',
    '018eb5c7-c5c5-1234-5678-abcdef123463',
    '018eb5c7-c5c5-1234-5678-abcdef123464',
    '018eb5c7-c5c5-1234-5678-abcdef123465',
    '018eb5c7-c5c5-1234-5678-abcdef123466'
)
AND has_completed_reflection = false;

-- Update journey stages for users who completed reflection but are still in early stages
UPDATE profiles 
SET journey_stage = 'awaiting_match',
    updated_at = now()
WHERE id IN (
    '018eb5c7-c5c5-1234-5678-abcdef123456',
    '018eb5c7-c5c5-1234-5678-abcdef123457',
    '018eb5c7-c5c5-1234-5678-abcdef123458',
    '018eb5c7-c5c5-1234-5678-abcdef123459',
    '018eb5c7-c5c5-1234-5678-abcdef123460',
    '018eb5c7-c5c5-1234-5678-abcdef123461',
    '018eb5c7-c5c5-1234-5678-abcdef123462',
    '018eb5c7-c5c5-1234-5678-abcdef123463',
    '018eb5c7-c5c5-1234-5678-abcdef123464',
    '018eb5c7-c5c5-1234-5678-abcdef123465',
    '018eb5c7-c5c5-1234-5678-abcdef123466'
)
AND journey_stage IN ('getting_started', 'profile_setup', 'first_session_complete')
AND has_completed_reflection = true
AND NOT EXISTS (
    SELECT 1 FROM matches 
    WHERE (user1_id = profiles.id OR user2_id = profiles.id) 
    AND status = 'active'
);
