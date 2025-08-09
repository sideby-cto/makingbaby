import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Play, Plus, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestScenario {
  id: string;
  scenario_name: string;
  scenario_type: string;
  test_steps: any;
  expected_outcomes: any;
  priority: string;
  tags: string[];
  environment: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface TestExecutionResult {
  id: string;
  scenario_id: string;
  status: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  error_details?: any;
  performance_data?: any;
  accessibility_violations?: any;
}

export const TestScenariosTab = () => {
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [results, setResults] = useState<TestExecutionResult[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());

  const [newScenario, setNewScenario] = useState({
    scenario_name: '',
    scenario_type: 'user_journey',
    test_steps: '[]',
    expected_outcomes: '[]',
    priority: 'medium',
    tags: '',
    environment: 'staging'
  });

  useEffect(() => {
    loadScenarios();
    loadResults();
  }, []);

  const loadScenarios = async () => {
    const { data, error } = await supabase
      .from('test_scenarios')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading scenarios",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setScenarios(data?.map(scenario => ({
      ...scenario,
      test_steps: Array.isArray(scenario.test_steps) ? scenario.test_steps : JSON.parse(scenario.test_steps as string || '[]'),
      expected_outcomes: Array.isArray(scenario.expected_outcomes) ? scenario.expected_outcomes : JSON.parse(scenario.expected_outcomes as string || '[]')
    })) || []);
  };

  const loadResults = async () => {
    const { data, error } = await supabase
      .from('test_execution_results')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(50);

    if (error) {
      toast({
        title: "Error loading results",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setResults(data?.map(result => ({
      ...result,
      accessibility_violations: Array.isArray(result.accessibility_violations) ? result.accessibility_violations : JSON.parse(result.accessibility_violations as string || '[]')
    })) || []);
  };

  const createScenario = async () => {
    try {
      const parsedSteps = JSON.parse(newScenario.test_steps);
      const parsedOutcomes = JSON.parse(newScenario.expected_outcomes);
      const tagsArray = newScenario.tags.split(',').map(tag => tag.trim()).filter(Boolean);

      const { data, error } = await supabase
        .from('test_scenarios')
        .insert([{
          ...newScenario,
          test_steps: parsedSteps,
          expected_outcomes: parsedOutcomes,
          tags: tagsArray
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Scenario created",
        description: "Test scenario created successfully"
      });

      setScenarios(prev => [{
        ...data,
        test_steps: Array.isArray(data.test_steps) ? data.test_steps : JSON.parse(data.test_steps as string || '[]'),
        expected_outcomes: Array.isArray(data.expected_outcomes) ? data.expected_outcomes : JSON.parse(data.expected_outcomes as string || '[]')
      }, ...prev]);
      setNewScenario({
        scenario_name: '',
        scenario_type: 'user_journey',
        test_steps: '[]',
        expected_outcomes: '[]',
        priority: 'medium',
        tags: '',
        environment: 'staging'
      });
      setShowCreateForm(false);
    } catch (error: any) {
      toast({
        title: "Error creating scenario",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const runScenario = async (scenarioId: string) => {
    setRunningTests(prev => new Set([...prev, scenarioId]));

    try {
      // Create execution record
      const { data: execution, error } = await supabase
        .from('test_execution_results')
        .insert([{
          scenario_id: scenarioId,
          status: 'running',
          start_time: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Call edge function to run the test
      const { data: result, error: functionError } = await supabase.functions.invoke('run-core-flow-tests', {
        body: { 
          scenarioId,
          executionId: execution.id
        }
      });

      if (functionError) throw functionError;

      toast({
        title: "Test started",
        description: "Test scenario is now running..."
      });

      // Poll for completion
      setTimeout(() => {
        loadResults();
        setRunningTests(prev => {
          const newSet = new Set(prev);
          newSet.delete(scenarioId);
          return newSet;
        });
      }, 5000);

    } catch (error: any) {
      toast({
        title: "Error running test",
        description: error.message,
        variant: "destructive"
      });
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(scenarioId);
        return newSet;
      });
    }
  };

  const toggleScenario = async (scenarioId: string, enabled: boolean) => {
    const { error } = await supabase
      .from('test_scenarios')
      .update({ enabled })
      .eq('id', scenarioId);

    if (error) {
      toast({
        title: "Error updating scenario",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setScenarios(prev => prev.map(s => 
      s.id === scenarioId ? { ...s, enabled } : s
    ));
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Test Scenarios</h2>
          <p className="text-muted-foreground">Manage and execute automated test scenarios</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Scenario
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Test Scenario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scenario_name">Scenario Name</Label>
                <Input
                  id="scenario_name"
                  value={newScenario.scenario_name}
                  onChange={(e) => setNewScenario(prev => ({ ...prev, scenario_name: e.target.value }))}
                  placeholder="Test scenario name"
                />
              </div>
              <div>
                <Label htmlFor="scenario_type">Type</Label>
                <Select value={newScenario.scenario_type} onValueChange={(value) => setNewScenario(prev => ({ ...prev, scenario_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user_journey">User Journey</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="accessibility">Accessibility</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newScenario.priority} onValueChange={(value) => setNewScenario(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="environment">Environment</Label>
                <Select value={newScenario.environment} onValueChange={(value) => setNewScenario(prev => ({ ...prev, environment: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={newScenario.tags}
                onChange={(e) => setNewScenario(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="authentication, onboarding, critical"
              />
            </div>
            <div>
              <Label htmlFor="test_steps">Test Steps (JSON)</Label>
              <Textarea
                id="test_steps"
                value={newScenario.test_steps}
                onChange={(e) => setNewScenario(prev => ({ ...prev, test_steps: e.target.value }))}
                placeholder='[{"action": "navigate", "target": "/login"}]'
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="expected_outcomes">Expected Outcomes (JSON)</Label>
              <Textarea
                id="expected_outcomes"
                value={newScenario.expected_outcomes}
                onChange={(e) => setNewScenario(prev => ({ ...prev, expected_outcomes: e.target.value }))}
                placeholder='[{"type": "redirect", "expectedUrl": "/dashboard"}]'
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createScenario}>Create Scenario</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {scenarios.map((scenario) => {
          const recentResult = results.find(r => r.scenario_id === scenario.id);
          const isRunning = runningTests.has(scenario.id);

          return (
            <Card key={scenario.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{scenario.scenario_name}</CardTitle>
                    <Badge className={getPriorityColor(scenario.priority)}>
                      {scenario.priority}
                    </Badge>
                    <Badge variant="outline">{scenario.scenario_type}</Badge>
                    {recentResult && getStatusIcon(recentResult.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={scenario.enabled}
                      onCheckedChange={(enabled) => toggleScenario(scenario.id, enabled)}
                    />
                    <Button
                      onClick={() => runScenario(scenario.id)}
                      disabled={!scenario.enabled || isRunning}
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isRunning ? 'Running...' : 'Run Test'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {scenario.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Environment: {scenario.environment} • 
                    Steps: {scenario.test_steps.length} • 
                    Outcomes: {scenario.expected_outcomes.length}
                  </div>
                  {recentResult && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Last run:</span> {' '}
                      {new Date(recentResult.start_time).toLocaleString()}
                      {recentResult.duration_ms && (
                        <span className="ml-2 text-muted-foreground">
                          ({recentResult.duration_ms}ms)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};