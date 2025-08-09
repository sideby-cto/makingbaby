-- Update the existing badge name from "Sideby Starter" to "Back to School"
UPDATE public.badges
SET name = 'Back to School',
    description = 'Get set up with sideby tools to collaborate effectively. Add the scheduler to your toolbox, set up 5 other tools, and create a professional learning goal for ''25-''26.',
    requirements = jsonb_set(
      requirements,
      '{required_tools_count}',
      '5'::jsonb
    )
WHERE name = 'Sideby Starter';

-- If the badge doesn't exist yet, create it
INSERT INTO public.badges (name, description, icon_name, badge_type, requirements, reward_description)
SELECT 
  'Back to School',
  'Get set up with sideby tools to collaborate effectively. Add the scheduler to your toolbox, set up 5 other tools, and create a professional learning goal for ''25-''26.',
  'Award',
  'achievement',
  '{
    "scheduler_added": false,
    "tools_count": 0,
    "learning_goal_created": false,
    "required_tools_count": 5
  }',
  'Personalized support from the sideby team'
WHERE NOT EXISTS (
  SELECT 1 FROM public.badges WHERE name = 'Back to School' OR name = 'Sideby Starter'
);