-- Update LEARN section description to change "This month" to "Let's start with"
UPDATE journey_stage_config 
SET description = 'Master concrete tools and competencies. Let''s start with creating, improvement, and maintenance of personal GPTs or assistants.'
WHERE stage = 'learn';