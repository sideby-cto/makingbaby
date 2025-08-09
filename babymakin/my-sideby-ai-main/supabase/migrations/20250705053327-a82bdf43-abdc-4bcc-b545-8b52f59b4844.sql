-- Core Flow Testing & Monitoring System Database Schema

-- Core flow test definitions
CREATE TABLE public.core_flow_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL, -- 'dashboard_setup', 'match_creation', 'conversation', 'output_generation', 'next_match'
  description TEXT,
  test_script JSONB NOT NULL, -- Test steps and assertions
  enabled BOOLEAN NOT NULL DEFAULT true,
  critical BOOLEAN NOT NULL DEFAULT false, -- If true, failure blocks changes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Core flow test executions
CREATE TABLE public.core_flow_test_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.core_flow_tests(id) ON DELETE CASCADE,
  execution_type TEXT NOT NULL, -- 'manual', 'scheduled', 'pre_deployment', 'continuous'
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'passed', 'failed', 'error'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  results JSONB, -- Test results, assertions, logs
  error_message TEXT,
  metadata JSONB -- Additional execution context
);

-- Core flow health metrics
CREATE TABLE public.core_flow_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_step TEXT NOT NULL, -- 'dashboard_setup', 'match_creation', 'conversation', 'output_generation', 'next_match'
  metric_type TEXT NOT NULL, -- 'success_rate', 'avg_duration', 'error_rate', 'user_satisfaction'
  value DECIMAL NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Core flow incidents
CREATE TABLE public.core_flow_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_step TEXT NOT NULL,
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'closed'
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  assignee_id UUID,
  resolution_notes TEXT,
  metadata JSONB
);

-- Core flow quality gates
CREATE TABLE public.core_flow_quality_gates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gate_name TEXT NOT NULL,
  flow_step TEXT NOT NULL,
  criteria JSONB NOT NULL, -- Quality criteria and thresholds
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Core flow alerts
CREATE TABLE public.core_flow_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL, -- 'test_failure', 'health_degradation', 'incident_created', 'quality_gate_failed'
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  flow_step TEXT,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Core flow recovery actions
CREATE TABLE public.core_flow_recovery_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES public.core_flow_incidents(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'restart_service', 'rollback_deployment', 'scale_resources', 'manual_intervention'
  action_script JSONB, -- Automated recovery steps
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  results JSONB,
  error_message TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.core_flow_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_flow_test_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_flow_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_flow_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_flow_quality_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_flow_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_flow_recovery_actions ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admin only access to core flow tests" ON public.core_flow_tests FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admin only access to test executions" ON public.core_flow_test_executions FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admin only access to health metrics" ON public.core_flow_health_metrics FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admin only access to incidents" ON public.core_flow_incidents FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admin only access to quality gates" ON public.core_flow_quality_gates FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admin only access to alerts" ON public.core_flow_alerts FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admin only access to recovery actions" ON public.core_flow_recovery_actions FOR ALL USING (is_current_user_admin());

-- Triggers for updated_at
CREATE TRIGGER update_core_flow_tests_updated_at BEFORE UPDATE ON public.core_flow_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_core_flow_quality_gates_updated_at BEFORE UPDATE ON public.core_flow_quality_gates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial test data
INSERT INTO public.core_flow_tests (test_name, test_type, description, test_script, critical) VALUES 
('Dashboard Load Test', 'dashboard_setup', 'Verify dashboard loads within 3 seconds and displays user data', 
 '{"steps": [{"action": "navigate", "target": "/dashboard"}, {"action": "waitForLoad", "timeout": 3000}, {"action": "assertExists", "selector": "[data-testid=user-profile]"}], "assertions": [{"type": "performance", "metric": "loadTime", "threshold": 3000}]}', 
 true),
('Match Creation Flow', 'match_creation', 'Test end-to-end match creation process',
 '{"steps": [{"action": "navigate", "target": "/admin/matchmaker"}, {"action": "selectUsers", "count": 2}, {"action": "createMatch"}, {"action": "verifyMatchCreated"}], "assertions": [{"type": "database", "table": "matches", "condition": "status = active"}]}',
 true),
('Conversation Functionality', 'conversation', 'Test 1:1 conversation features',
 '{"steps": [{"action": "openMatch"}, {"action": "sendMessage", "content": "Test message"}, {"action": "verifyMessageSent"}, {"action": "verifyNotificationSent"}], "assertions": [{"type": "realtime", "event": "message_received"}]}',
 true);

-- Initial quality gates
INSERT INTO public.core_flow_quality_gates (gate_name, flow_step, criteria) VALUES
('Dashboard Performance Gate', 'dashboard_setup', '{"loadTime": {"max": 3000}, "errorRate": {"max": 0.01}}'),
('Match Success Rate Gate', 'match_creation', '{"successRate": {"min": 0.95}, "avgCreationTime": {"max": 5000}}'),
('Conversation Reliability Gate', 'conversation', '{"messageDeliveryRate": {"min": 0.99}, "realtimeLatency": {"max": 1000}}');