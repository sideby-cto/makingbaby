
-- Enhanced core flow test execution tracking
ALTER TABLE public.core_flow_test_executions 
ADD COLUMN IF NOT EXISTS user_journey_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS performance_metrics JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS accessibility_results JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS visual_regression_data JSONB DEFAULT '{}';

-- Create comprehensive test scenarios table
CREATE TABLE IF NOT EXISTS public.test_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_name TEXT NOT NULL,
  scenario_type TEXT NOT NULL, -- 'user_journey', 'performance', 'accessibility', 'integration'
  test_steps JSONB NOT NULL DEFAULT '[]',
  expected_outcomes JSONB NOT NULL DEFAULT '[]',
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  tags TEXT[] DEFAULT '{}',
  environment TEXT DEFAULT 'staging',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  enabled BOOLEAN DEFAULT true
);

-- Create test execution results table
CREATE TABLE IF NOT EXISTS public.test_execution_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID REFERENCES public.test_scenarios(id) ON DELETE CASCADE,
  execution_id UUID REFERENCES public.core_flow_test_executions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'passed', 'failed', 'skipped'
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  screenshots JSONB DEFAULT '[]',
  error_details JSONB DEFAULT '{}',
  performance_data JSONB DEFAULT '{}',
  accessibility_violations JSONB DEFAULT '[]',
  network_conditions JSONB DEFAULT '{}',
  device_info JSONB DEFAULT '{}',
  user_actions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create synthetic monitoring table
CREATE TABLE IF NOT EXISTS public.synthetic_monitoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  monitor_name TEXT NOT NULL,
  monitor_type TEXT NOT NULL, -- 'uptime', 'performance', 'user_journey', 'api'
  target_url TEXT NOT NULL,
  check_frequency INTEGER NOT NULL DEFAULT 300, -- seconds
  timeout_ms INTEGER DEFAULT 30000,
  expected_response_time_ms INTEGER DEFAULT 3000,
  assertions JSONB NOT NULL DEFAULT '[]',
  locations TEXT[] DEFAULT '{"us-east-1"}',
  last_check_at TIMESTAMP WITH TIME ZONE,
  last_status TEXT DEFAULT 'unknown',
  consecutive_failures INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create synthetic check results table
CREATE TABLE IF NOT EXISTS public.synthetic_check_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  monitor_id UUID REFERENCES public.synthetic_monitoring(id) ON DELETE CASCADE,
  check_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL, -- 'success', 'failure', 'timeout', 'error'
  response_time_ms INTEGER,
  error_message TEXT,
  response_code INTEGER,
  response_body TEXT,
  assertions_passed INTEGER DEFAULT 0,
  assertions_failed INTEGER DEFAULT 0,
  location TEXT DEFAULT 'us-east-1',
  metadata JSONB DEFAULT '{}'
);

-- Create performance budgets table
CREATE TABLE IF NOT EXISTS public.performance_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  metric_name TEXT NOT NULL, -- 'LCP', 'FID', 'CLS', 'TTFB', 'load_time'
  budget_value DECIMAL NOT NULL,
  unit TEXT NOT NULL DEFAULT 'ms', -- 'ms', 'score', 'bytes'
  severity TEXT NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'error'
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.test_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_execution_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synthetic_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synthetic_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_budgets ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for all new tables
CREATE POLICY "Admin only access to test scenarios" ON public.test_scenarios FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admin only access to test execution results" ON public.test_execution_results FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admin only access to synthetic monitoring" ON public.synthetic_monitoring FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admin only access to synthetic check results" ON public.synthetic_check_results FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admin only access to performance budgets" ON public.performance_budgets FOR ALL USING (is_current_user_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_scenarios_type ON public.test_scenarios(scenario_type);
CREATE INDEX IF NOT EXISTS idx_test_scenarios_priority ON public.test_scenarios(priority);
CREATE INDEX IF NOT EXISTS idx_test_execution_results_status ON public.test_execution_results(status);
CREATE INDEX IF NOT EXISTS idx_test_execution_results_created_at ON public.test_execution_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_synthetic_monitoring_enabled ON public.synthetic_monitoring(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_synthetic_check_results_check_time ON public.synthetic_check_results(check_time DESC);
CREATE INDEX IF NOT EXISTS idx_performance_budgets_page_path ON public.performance_budgets(page_path);

-- Insert initial test scenarios
INSERT INTO public.test_scenarios (scenario_name, scenario_type, test_steps, expected_outcomes, priority, tags) VALUES 
('Complete User Registration Journey', 'user_journey', 
 '[
   {"action": "navigate", "target": "/register"},
   {"action": "fillForm", "fields": {"email": "test@example.com", "password": "Test123!", "firstName": "Test", "lastName": "User"}},
   {"action": "submit", "form": "registration"},
   {"action": "waitForRedirect", "target": "/dashboard"},
   {"action": "verifyElement", "selector": "[data-testid=welcome-message]"}
 ]',
 '[
   {"type": "redirect", "expectedUrl": "/dashboard"},
   {"type": "elementExists", "selector": "[data-testid=user-profile]"},
   {"type": "databaseRecord", "table": "profiles", "condition": "email = test@example.com"}
 ]',
 'critical', '{"authentication", "onboarding"}'),

('Dashboard Performance Under Load', 'performance',
 '[
   {"action": "login", "credentials": {"email": "test@example.com", "password": "Test123!"}},
   {"action": "navigate", "target": "/dashboard"},
   {"action": "measurePerformance", "metrics": ["LCP", "FID", "CLS", "TTFB"]},
   {"action": "simulateLoad", "concurrentUsers": 10}
 ]',
 '[
   {"type": "performance", "metric": "LCP", "threshold": 2500},
   {"type": "performance", "metric": "FID", "threshold": 100},
   {"type": "performance", "metric": "CLS", "threshold": 0.1}
 ]',
 'high', '{"performance", "dashboard"}'),

('Accessibility Compliance Check', 'accessibility',
 '[
   {"action": "navigate", "target": "/"},
   {"action": "runAxeAudit", "rules": ["wcag2a", "wcag2aa"]},
   {"action": "checkKeyboardNavigation"},
   {"action": "checkScreenReader", "announcements": true}
 ]',
 '[
   {"type": "accessibility", "violations": 0, "severity": "serious"},
   {"type": "keyboardNavigation", "allElementsReachable": true},
   {"type": "screenReader", "properAnnouncements": true}
 ]',
 'high', '{"accessibility", "compliance"}');

-- Insert performance budgets
INSERT INTO public.performance_budgets (page_path, metric_name, budget_value, unit, severity) VALUES
('/', 'LCP', 2500, 'ms', 'error'),
('/', 'FID', 100, 'ms', 'error'),
('/', 'CLS', 0.1, 'score', 'error'),
('/dashboard', 'LCP', 3000, 'ms', 'warning'),
('/dashboard', 'TTFB', 800, 'ms', 'warning'),
('/register', 'LCP', 2000, 'ms', 'error');

-- Insert synthetic monitors
INSERT INTO public.synthetic_monitoring (monitor_name, monitor_type, target_url, check_frequency, assertions) VALUES
('Homepage Uptime', 'uptime', 'https://my.sideby.ai/', 300, 
 '[{"type": "status", "operator": "equals", "value": 200}]'),
('Dashboard Performance', 'performance', 'https://my.sideby.ai/dashboard', 600,
 '[{"type": "responseTime", "operator": "lessThan", "value": 3000}]'),
('Registration Flow', 'user_journey', 'https://my.sideby.ai/register', 1800,
 '[{"type": "elementExists", "selector": "#signup-email"}, {"type": "elementExists", "selector": "#signup-password"}]');
