-- Create chaos testing logs table to store test results
CREATE TABLE IF NOT EXISTS public.chaos_test_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_session_id UUID NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('error', 'dead_end', 'vulnerability', 'performance')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  stack_trace TEXT,
  user_action TEXT,
  reproduction_steps JSONB NOT NULL DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create chaos test sessions table to track testing sessions
CREATE TABLE IF NOT EXISTS public.chaos_test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'stopped', 'failed')),
  total_actions INTEGER DEFAULT 0,
  errors_found INTEGER DEFAULT 0,
  dead_ends_found INTEGER DEFAULT 0,
  vulnerabilities_found INTEGER DEFAULT 0,
  performance_issues INTEGER DEFAULT 0,
  coverage_percent DECIMAL(5,2) DEFAULT 0,
  test_duration_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.chaos_test_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chaos_test_sessions ENABLE ROW LEVEL SECURITY;

-- Admin users can manage all chaos testing data
CREATE POLICY "Admin users can manage chaos test logs" ON public.chaos_test_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
    )
  );

CREATE POLICY "Admin users can manage chaos test sessions" ON public.chaos_test_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
    )
  );

-- Add updated_at trigger for sessions
CREATE OR REPLACE FUNCTION public.update_chaos_test_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chaos_test_sessions_updated_at
  BEFORE UPDATE ON public.chaos_test_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chaos_test_sessions_updated_at();