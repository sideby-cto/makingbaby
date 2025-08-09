-- Update compass descriptor copy as requested
UPDATE journey_stage_config 
SET description = 'Master concrete tools and competencies. This month we''re focused on creating, improvement, and maintenance of personal GPTs or assistants.'
WHERE stage = 'learn';

UPDATE journey_stage_config 
SET description = 'Create a "scheduler" to make it easier to find time with partners.'
WHERE stage = 'match';

UPDATE journey_stage_config 
SET description = 'Engage with community and share knowledge. As we get ready to go back to school, we''re sharing favorite tools. The goal is to add a new one to your quiver.'
WHERE stage = 'talk';