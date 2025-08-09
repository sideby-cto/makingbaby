import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Plus, Gauge, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PerformanceBudget {
  id: string;
  page_path: string;
  metric_name: string;
  budget_value: number;
  unit: string;
  severity: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface PerformanceMetric {
  page_path: string;
  metric_name: string;
  current_value: number;
  budget_value: number;
  status: 'pass' | 'warn' | 'fail';
  last_measured: string;
}

export const PerformanceBudgetsTab = () => {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<PerformanceBudget[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newBudget, setNewBudget] = useState({
    page_path: '/',
    metric_name: 'LCP',
    budget_value: 2500,
    unit: 'ms',
    severity: 'warning'
  });

  useEffect(() => {
    loadBudgets();
    loadMetrics();
  }, []);

  const loadBudgets = async () => {
    const { data, error } = await supabase
      .from('performance_budgets')
      .select('*')
      .order('page_path')
      .order('metric_name');

    if (error) {
      toast({
        title: "Error loading budgets",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setBudgets(data || []);
  };

  const loadMetrics = async () => {
    // Simulate current performance metrics
    // In a real implementation, this would come from Core Web Vitals API or similar
    const mockMetrics: PerformanceMetric[] = [
      {
        page_path: '/',
        metric_name: 'LCP',
        current_value: 2200,
        budget_value: 2500,
        status: 'pass',
        last_measured: new Date().toISOString()
      },
      {
        page_path: '/',
        metric_name: 'FID',
        current_value: 120,
        budget_value: 100,
        status: 'warn',
        last_measured: new Date().toISOString()
      },
      {
        page_path: '/dashboard',
        metric_name: 'LCP',
        current_value: 3200,
        budget_value: 3000,
        status: 'fail',
        last_measured: new Date().toISOString()
      }
    ];

    setMetrics(mockMetrics);
  };

  const createBudget = async () => {
    const { data, error } = await supabase
      .from('performance_budgets')
      .insert([newBudget])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error creating budget",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Budget created",
      description: "Performance budget created successfully"
    });

    setBudgets(prev => [...prev, data]);
    setNewBudget({
      page_path: '/',
      metric_name: 'LCP',
      budget_value: 2500,
      unit: 'ms',
      severity: 'warning'
    });
    setShowCreateForm(false);
  };

  const toggleBudget = async (budgetId: string, enabled: boolean) => {
    const { error } = await supabase
      .from('performance_budgets')
      .update({ enabled })
      .eq('id', budgetId);

    if (error) {
      toast({
        title: "Error updating budget",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setBudgets(prev => prev.map(b => 
      b.id === budgetId ? { ...b, enabled } : b
    ));
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      info: "bg-blue-100 text-blue-800",
      warning: "bg-orange-100 text-orange-800",
      error: "bg-red-100 text-red-800"
    };
    return colors[severity as keyof typeof colors] || colors.warning;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Gauge className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMetricDescription = (metricName: string) => {
    const descriptions = {
      LCP: 'Largest Contentful Paint - measures loading performance',
      FID: 'First Input Delay - measures interactivity',
      CLS: 'Cumulative Layout Shift - measures visual stability',
      TTFB: 'Time to First Byte - measures server response time',
      load_time: 'Total page load time'
    };
    return descriptions[metricName as keyof typeof descriptions] || 'Performance metric';
  };

  const getMetricForBudget = (budget: PerformanceBudget) => {
    return metrics.find(m => 
      m.page_path === budget.page_path && 
      m.metric_name === budget.metric_name
    );
  };

  const getPerformanceScore = (current: number, budget: number, unit: string) => {
    if (unit === 'score') {
      // For scores like CLS, lower is better but scoring is inverted
      return Math.max(0, Math.min(100, (budget / current) * 100));
    } else {
      // For time-based metrics, lower is better
      return Math.max(0, Math.min(100, (budget / current) * 100));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Budgets</h2>
          <p className="text-muted-foreground">Set and monitor performance thresholds for key pages</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Performance Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="page_path">Page Path</Label>
                <Input
                  id="page_path"
                  value={newBudget.page_path}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, page_path: e.target.value }))}
                  placeholder="/"
                />
              </div>
              <div>
                <Label htmlFor="metric_name">Metric</Label>
                <Select value={newBudget.metric_name} onValueChange={(value) => setNewBudget(prev => ({ ...prev, metric_name: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LCP">LCP (Largest Contentful Paint)</SelectItem>
                    <SelectItem value="FID">FID (First Input Delay)</SelectItem>
                    <SelectItem value="CLS">CLS (Cumulative Layout Shift)</SelectItem>
                    <SelectItem value="TTFB">TTFB (Time to First Byte)</SelectItem>
                    <SelectItem value="load_time">Load Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget_value">Budget Value</Label>
                <Input
                  id="budget_value"
                  type="number"
                  value={newBudget.budget_value}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, budget_value: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={newBudget.unit} onValueChange={(value) => setNewBudget(prev => ({ ...prev, unit: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ms">Milliseconds (ms)</SelectItem>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="bytes">Bytes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select value={newBudget.severity} onValueChange={(value) => setNewBudget(prev => ({ ...prev, severity: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createBudget}>Create Budget</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {budgets.map((budget) => {
          const metric = getMetricForBudget(budget);
          const score = metric ? getPerformanceScore(metric.current_value, budget.budget_value, budget.unit) : 0;

          return (
            <Card key={budget.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">
                      {budget.page_path} - {budget.metric_name}
                    </CardTitle>
                    <Badge className={getSeverityColor(budget.severity)}>
                      {budget.severity}
                    </Badge>
                    {metric && getStatusIcon(metric.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={budget.enabled}
                      onCheckedChange={(enabled) => toggleBudget(budget.id, enabled)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {getMetricDescription(budget.metric_name)}
                  </p>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {budget.budget_value}{budget.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">Budget Target</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {metric ? `${metric.current_value}${budget.unit}` : 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">Current Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(score)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Performance Score</div>
                    </div>
                  </div>

                  {metric && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Performance</span>
                        <span className={
                          metric.status === 'pass' ? 'text-green-600' :
                          metric.status === 'warn' ? 'text-orange-600' : 'text-red-600'
                        }>
                          {metric.status.toUpperCase()}
                        </span>
                      </div>
                      <Progress 
                        value={score} 
                        className={`
                          ${score >= 90 ? 'text-green-500' : 
                            score >= 70 ? 'text-orange-500' : 'text-red-500'}
                        `}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Last measured: {new Date(metric.last_measured).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {!metric && (
                    <div className="text-center py-4 text-muted-foreground">
                      <Gauge className="w-8 h-8 mx-auto mb-2" />
                      <p>No recent measurements available</p>
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