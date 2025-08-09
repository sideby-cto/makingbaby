
-- Initial migration to capture current database schema
-- This migration establishes a baseline for the existing database structure

-- Create the enhanced_transcript_analysis table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.enhanced_transcript_analysis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transcript_id uuid NOT NULL,
  user_id uuid NOT NULL,
  emotional_sentiment jsonb,
  engagement_patterns jsonb,
  semantic_topics jsonb,
  expertise_indicators jsonb,
  learning_moments jsonb,
  personality_traits jsonb,
  analysis_version text DEFAULT '1.0',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create the journey_stage_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.journey_stage_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage text NOT NULL,
  reminder_times jsonb DEFAULT '[]'::jsonb,
  welcome_email_enabled boolean DEFAULT false,
  welcome_email_delay_hours integer DEFAULT 24,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create the journey_reminder_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.journey_reminder_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage text NOT NULL,
  reminder_type text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  cta_text text,
  cta_url text,
  active boolean DEFAULT true,
  email_template_id uuid,
  template_variables text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create the journey_reminder_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.journey_reminder_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  stage text NOT NULL,
  reminder_type text NOT NULL,
  template_id uuid,
  notification_id uuid,
  success boolean DEFAULT true,
  sent_at timestamp with time zone DEFAULT now()
);

-- Create the notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  channels jsonb DEFAULT '{"sms": false, "email": false, "in_app": true}'::jsonb,
  data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'delivered',
  error text,
  priority text DEFAULT 'normal'
);

-- Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  email text NOT NULL,
  first_name text,
  last_name text,
  status text DEFAULT 'active',
  journey_stage text DEFAULT 'new',
  has_completed_reflection boolean DEFAULT false
);

-- Create the upduo_transcripts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.upduo_transcripts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  conversation_id text NOT NULL,
  transcript jsonb NOT NULL,
  metadata jsonb,
  session_duration integer DEFAULT 0,
  quality_score integer DEFAULT 0,
  word_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create the user_journey_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_journey_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  previous_stage text,
  new_stage text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Add any missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_enhanced_transcript_analysis_user_id ON public.enhanced_transcript_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_transcript_analysis_transcript_id ON public.enhanced_transcript_analysis(transcript_id);
CREATE INDEX IF NOT EXISTS idx_journey_reminder_logs_user_id ON public.journey_reminder_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_upduo_transcripts_user_id ON public.upduo_transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_user_id ON public.user_journey_events(user_id);

-- Update the profiles table to ensure it has the required columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS journey_stage text DEFAULT 'new',
ADD COLUMN IF NOT EXISTS has_completed_reflection boolean DEFAULT false;

-- Ensure all tables have proper updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_enhanced_transcript_analysis_updated_at ON public.enhanced_transcript_analysis;
CREATE TRIGGER update_enhanced_transcript_analysis_updated_at
    BEFORE UPDATE ON public.enhanced_transcript_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_journey_stage_config_updated_at ON public.journey_stage_config;
CREATE TRIGGER update_journey_stage_config_updated_at
    BEFORE UPDATE ON public.journey_stage_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_journey_reminder_templates_updated_at ON public.journey_reminder_templates;
CREATE TRIGGER update_journey_reminder_templates_updated_at
    BEFORE UPDATE ON public.journey_reminder_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_upduo_transcripts_updated_at ON public.upduo_transcripts;
CREATE TRIGGER update_upduo_transcripts_updated_at
    BEFORE UPDATE ON public.upduo_transcripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
