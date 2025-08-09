-- Add compass descriptor fields to journey_stage_config table
ALTER TABLE journey_stage_config 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon_name TEXT,
ADD COLUMN IF NOT EXISTS color_scheme TEXT;

-- Insert default compass area configurations if they don't exist
INSERT INTO journey_stage_config (stage, display_name, description, icon_name, color_scheme, created_at, updated_at)
VALUES 
  ('learn', 'LEARN', 'Master concrete tools and competencies', 'BookOpen', 'blue', now(), now()),
  ('talk', 'TALK', 'Engage with community and share knowledge', 'MessageCircle', 'green', now(), now()),
  ('grow', 'GROW', 'Set personal goals and reflect on progress', 'TrendingUp', 'purple', now(), now()),
  ('match', 'MATCH', 'Connect with peers and schedule collaborations', 'Users', 'orange', now(), now())
ON CONFLICT (stage) DO UPDATE SET
  display_name = COALESCE(journey_stage_config.display_name, EXCLUDED.display_name),
  description = COALESCE(journey_stage_config.description, EXCLUDED.description),
  icon_name = COALESCE(journey_stage_config.icon_name, EXCLUDED.icon_name),
  color_scheme = COALESCE(journey_stage_config.color_scheme, EXCLUDED.color_scheme),
  updated_at = now();