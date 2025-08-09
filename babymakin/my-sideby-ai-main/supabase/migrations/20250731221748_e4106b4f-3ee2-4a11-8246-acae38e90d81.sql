-- Insert new upcoming badges
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
  'b1e4d5f8-3a2c-4d7e-9f1a-8b6c5e4d3a2b',
  'AI Onward',
  'Don''t fall back - advance your AI integration and maintain momentum in your educational practice',
  'achievement',
  '{"description": "Demonstrate continued progress and avoid regression in AI implementation"}',
  'ArrowRight',
  now(),
  now()
),
(
  'c2f5e6g9-4b3d-5e8f-0g2b-9c7d6f5e4b3c',
  'AI Resolutions', 
  'New year, new schools, new opportunities - set and achieve meaningful AI-focused goals for educational transformation',
  'achievement',
  '{"description": "Set and work toward AI implementation resolutions for the new year"}',
  'Target',
  now(),
  now()
),
(
  'd3g6f7h0-5c4e-6f9g-1h3c-0d8e7g6f5c4d',
  'AI Refresh',
  'Analogous to Spring cleaning - you''ve learned a lot and the world has changed. Declutter your AI approach to finish strong',
  'achievement', 
  '{"description": "Review, refine, and declutter AI tools and practices for optimal effectiveness"}',
  'RefreshCw',
  now(),
  now()
);