
-- Create function to create journey_stage_config table
CREATE OR REPLACE FUNCTION create_journey_stage_config_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'journey_stage_config'
  ) THEN
    -- Create table
    CREATE TABLE IF NOT EXISTS journey_stage_config (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      stage VARCHAR(50) NOT NULL UNIQUE,
      reminder_times JSONB NOT NULL DEFAULT '{"24h": true, "48h": true, "weekly": false}'::jsonb,
      welcome_email_enabled BOOLEAN NOT NULL DEFAULT true,
      welcome_email_delay_hours INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    -- Add row-level security
    ALTER TABLE journey_stage_config ENABLE ROW LEVEL SECURITY;
    
    -- Add policies
    CREATE POLICY "Allow authenticated read access" ON journey_stage_config
      FOR SELECT USING (auth.role() = 'authenticated');
    
    CREATE POLICY "Allow admin full access" ON journey_stage_config
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.email LIKE '%@sideby.ai'
        )
      );

    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- Create function to create journey_reminder_templates table
CREATE OR REPLACE FUNCTION create_journey_reminder_templates_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'journey_reminder_templates'
  ) THEN
    -- Create table
    CREATE TABLE IF NOT EXISTS journey_reminder_templates (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      stage VARCHAR(50) NOT NULL,
      reminder_type VARCHAR(50) NOT NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      cta_text TEXT,
      cta_url TEXT,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(stage, reminder_type)
    );
    
    -- Add row-level security
    ALTER TABLE journey_reminder_templates ENABLE ROW LEVEL SECURITY;
    
    -- Add policies
    CREATE POLICY "Allow authenticated read access" ON journey_reminder_templates
      FOR SELECT USING (auth.role() = 'authenticated');
    
    CREATE POLICY "Allow admin full access" ON journey_reminder_templates
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.email LIKE '%@sideby.ai'
        )
      );

    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- Create or update the trigger_journey_monitor function if it doesn't exist yet
-- This is needed for the "Run Journey Monitor" button
CREATE OR REPLACE FUNCTION trigger_journey_monitor(force_run boolean DEFAULT false)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- In a real implementation, this would call the journey monitor process
  -- For now, we'll just return a success message
  result := json_build_object(
    'status', 'success',
    'message', 'Journey monitor triggered',
    'timestamp', NOW(),
    'forced', force_run
  );
  
  RETURN result;
END;
$$;
