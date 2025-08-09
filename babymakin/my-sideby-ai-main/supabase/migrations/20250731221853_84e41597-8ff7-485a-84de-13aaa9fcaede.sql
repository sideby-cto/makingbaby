-- Insert new upcoming badges with properly formatted UUIDs
INSERT INTO public.badges (
  id,
  name,
  description,
  badge_type,
  requirements,
  icon_name,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'AI Onward',
  'Don''t fall back - advance your AI integration and maintain momentum in your educational practice',
  'achievement',
  '{"description": "Demonstrate continued progress and avoid regression in AI implementation"}',
  'ArrowRight',
  now(),
  now()
),
(
  gen_random_uuid(),
  'AI Resolutions', 
  'New year, new schools, new opportunities - set and achieve meaningful AI-focused goals for educational transformation',
  'achievement',
  '{"description": "Set and work toward AI implementation resolutions for the new year"}',
  'Target',
  now(),
  now()
),
(
  gen_random_uuid(),
  'AI Refresh',
  'Analogous to Spring cleaning - you''ve learned a lot and the world has changed. Declutter your AI approach to finish strong',
  'achievement', 
  '{"description": "Review, refine, and declutter AI tools and practices for optimal effectiveness"}',
  'RefreshCw',
  now(),
  now()
);