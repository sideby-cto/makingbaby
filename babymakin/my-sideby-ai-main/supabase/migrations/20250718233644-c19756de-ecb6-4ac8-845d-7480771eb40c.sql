
-- Create table for load test configurations
CREATE TABLE public.load_test_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_url TEXT NOT NULL,
  virtual_users INTEGER NOT NULL DEFAULT 10,
  duration_seconds INTEGER NOT NULL DEFAULT 60,
  ramp_up_seconds INTEGER NOT NULL DEFAULT 10,
  test_scenario JSONB NOT NULL DEFAULT '{}',
  headers JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for load test executions
CREATE TABLE public.load_test_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  configuration_id UUID REFERENCES public.load_test_configurations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  average_response_time DECIMAL(10,2),
  min_response_time DECIMAL(10,2),
  max_response_time DECIMAL(10,2),
  requests_per_second DECIMAL(10,2),
  error_rate DECIMAL(5,2),
  results_data JSONB DEFAULT '{}',
  error_details JSONB DEFAULT '[]',
  performance_metrics JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for real-time load test metrics
CREATE TABLE public.load_test_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID REFERENCES public.load_test_executions(id) ON DELETE CASCADE,
  timestamp_recorded TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active_users INTEGER NOT NULL,
  requests_per_second DECIMAL(10,2),
  response_time DECIMAL(10,2),
  error_count INTEGER DEFAULT 0,
  cpu_usage DECIMAL(5,2),
  memory_usage DECIMAL(5,2),
  network_io JSONB DEFAULT '{}',
  custom_metrics JSONB DEFAULT '{}'
);

-- Add RLS policies for load test configurations
ALTER TABLE public.load_test_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage load test configurations" 
  ON public.load_test_configurations 
  FOR ALL 
  USING (public.is_sideby_admin(auth.uid()));

-- Add RLS policies for load test executions
ALTER TABLE public.load_test_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage load test executions" 
  ON public.load_test_executions 
  FOR ALL 
  USING (public.is_sideby_admin(auth.uid()));

-- Add RLS policies for load test metrics
ALTER TABLE public.load_test_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view load test metrics" 
  ON public.load_test_metrics 
  FOR SELECT 
  USING (public.is_sideby_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_load_test_executions_status ON public.load_test_executions(status);
CREATE INDEX idx_load_test_executions_created_at ON public.load_test_executions(created_at DESC);
CREATE INDEX idx_load_test_metrics_execution_id ON public.load_test_metrics(execution_id);
CREATE INDEX idx_load_test_metrics_timestamp ON public.load_test_metrics(timestamp_recorded DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_load_test_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_load_test_configurations_updated_at
  BEFORE UPDATE ON public.load_test_configurations
  FOR EACH ROW EXECUTE FUNCTION update_load_test_updated_at();

CREATE TRIGGER update_load_test_executions_updated_at
  BEFORE UPDATE ON public.load_test_executions
  FOR EACH ROW EXECUTE FUNCTION update_load_test_updated_at();
