
-- Phase 1: Database Consolidation
-- Drop redundant tables and consolidate into a single, simplified core_flow_tests table

-- First, drop the existing complex tables
DROP TABLE IF EXISTS public.core_flow_test_executions CASCADE;
DROP TABLE IF EXISTS public.core_flow_health_metrics CASCADE;
DROP TABLE IF EXISTS public.core_flow_alerts CASCADE;
DROP TABLE IF EXISTS public.core_flow_incidents CASCADE;
DROP TABLE IF EXISTS public.core_flow_quality_gates CASCADE;
DROP TABLE IF EXISTS public.core_flow_recovery_actions CASCADE;

-- Recreate a simplified core_flow_tests table
DROP TABLE IF EXISTS public.core_flow_tests CASCADE;

CREATE TABLE public.core_flow_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('unit', 'integration', 'e2e', 'performance', 'accessibility')),
  description TEXT,
  test_script JSONB NOT NULL DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT true,
  critical BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Execution tracking fields
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_status TEXT CHECK (last_status IN ('passed', 'failed', 'running', 'pending')),
  last_duration_ms INTEGER,
  last_error_message TEXT,
  
  -- Simple metrics
  total_runs INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  
  UNIQUE(test_name, test_type)
);

-- Create a simplified test_executions table for history
CREATE TABLE public.core_flow_test_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.core_flow_tests(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'running', 'pending')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  error_message TEXT,
  results JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE public.core_flow_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_flow_test_executions ENABLE ROW LEVEL SECURITY;

-- Admin only access policies
CREATE POLICY "Admin only access to core flow tests" 
  ON public.core_flow_tests 
  FOR ALL 
  USING (is_current_user_admin());

CREATE POLICY "Admin only access to test executions" 
  ON public.core_flow_test_executions 
  FOR ALL 
  USING (is_current_user_admin());

-- Create indexes for performance
CREATE INDEX idx_core_flow_tests_enabled ON public.core_flow_tests(enabled);
CREATE INDEX idx_core_flow_tests_critical ON public.core_flow_tests(critical);
CREATE INDEX idx_core_flow_tests_last_run ON public.core_flow_tests(last_run_at DESC);
CREATE INDEX idx_test_executions_test_id ON public.core_flow_test_executions(test_id);
CREATE INDEX idx_test_executions_started_at ON public.core_flow_test_executions(started_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_core_flow_tests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_core_flow_tests_updated_at
  BEFORE UPDATE ON public.core_flow_tests
  FOR EACH ROW EXECUTE FUNCTION update_core_flow_tests_updated_at();

-- Insert some sample test data
INSERT INTO public.core_flow_tests (test_name, test_type, description, test_script, critical) VALUES
('User Registration Flow', 'e2e', 'Tests the complete user registration process', '{"steps": ["visit_signup", "fill_form", "verify_email"]}', true),
('Database Connection', 'integration', 'Verifies database connectivity and basic operations', '{"queries": ["SELECT 1", "SELECT COUNT(*) FROM profiles"]}', true),
('API Response Time', 'performance', 'Measures API response times for critical endpoints', '{"endpoints": ["/api/profiles", "/api/auth"]}', false),
('Form Accessibility', 'accessibility', 'Checks form accessibility compliance', '{"tools": ["axe-core"], "pages": ["/signup", "/login"]}', false),
('Authentication Unit Tests', 'unit', 'Unit tests for authentication functions', '{"tests": ["validateEmail", "hashPassword", "generateToken"]}', true);
