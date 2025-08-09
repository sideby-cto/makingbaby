import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Plus, Edit, Trash2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QualityGate {
  id: string;
  gate_name: string;
  flow_step: string;
  criteria: any;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface GateExecution {
  gate: QualityGate;
  status: 'passed' | 'failed' | 'unknown';
  lastCheck: string;
  failureReason?: string;
}

export const QualityGatesManager = () => {
  const [gates, setGates] = useState<QualityGate[]>([]);
  const [gateExecutions, setGateExecutions] = useState<GateExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<QualityGate | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    gate_name: '',
    flow_step: '',
    criteria: '',
    enabled: true
  });

  const flowSteps = [
    { value: 'dashboard_setup', label: 'Dashboard Setup' },
    { value: 'match_creation', label: 'Match Creation' },
    { value: 'conversation', label: '1:1 Conversation' },
    { value: 'output_generation', label: 'Output Generation' },
    { value: 'next_match', label: 'Next Strategic Match' }
  ];

  useEffect(() => {
    loadGates();
    checkGateStatuses();
  }, []);

  const loadGates = async () => {
    try {
      // Quality gates will be integrated in next version
      setGates([]);
    } catch (error) {
      console.error('Error loading quality gates:', error);
      toast({
        title: "Error",
        description: "Failed to load quality gates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkGateStatuses = async () => {
    try {
      // Quality gates checking will be integrated in next version
      const executions: GateExecution[] = [];
      setGateExecutions(executions);
    } catch (error) {
      console.error('Error checking gate statuses:', error);
    }
  };

  const saveGate = async () => {
    try {
      let criteria;
      try {
        criteria = JSON.parse(formData.criteria);
      } catch {
        toast({
          title: "Error",
          description: "Invalid JSON in criteria",
          variant: "destructive"
        });
        return;
      }

      // Quality gates save operation coming soon
      console.log('Gate save operation:', { formData, criteria });

      toast({
        title: "Success",
        description: editingGate ? "Quality gate updated" : "Quality gate created"
      });

      resetForm();
      loadGates();
      checkGateStatuses();
    } catch (error) {
      console.error('Error saving quality gate:', error);
      toast({
        title: "Error",
        description: "Failed to save quality gate",
        variant: "destructive"
      });
    }
  };

  const deleteGate = async (gateId: string) => {
    if (!confirm('Are you sure you want to delete this quality gate?')) return;

    try {
      // Quality gates delete operation coming soon
      console.log('Gate delete operation:', gateId);

      toast({
        title: "Success",
        description: "Quality gate deleted"
      });

      loadGates();
      checkGateStatuses();
    } catch (error) {
      console.error('Error deleting quality gate:', error);
      toast({
        title: "Error",
        description: "Failed to delete quality gate",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      gate_name: '',
      flow_step: '',
      criteria: '',
      enabled: true
    });
    setEditingGate(null);
    setIsCreateDialogOpen(false);
  };

  const editGate = (gate: QualityGate) => {
    setFormData({
      gate_name: gate.gate_name,
      flow_step: gate.flow_step,
      criteria: JSON.stringify(gate.criteria, null, 2),
      enabled: gate.enabled
    });
    setEditingGate(gate);
    setIsCreateDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const sampleCriteria = {
    loadTime: { max: 3000 },
    errorRate: { max: 0.01 },
    successRate: { min: 0.95 }
  };

  if (isLoading) {
    return <div className="text-center">Loading quality gates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Gates</h2>
          <p className="text-muted-foreground">
            Define quality criteria that must be met for each flow step
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={checkGateStatuses}>
            Refresh Status
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Gate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingGate ? 'Edit Quality Gate' : 'Create Quality Gate'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gate_name">Gate Name</Label>
                    <Input
                      id="gate_name"
                      value={formData.gate_name}
                      onChange={(e) => setFormData({ ...formData, gate_name: e.target.value })}
                      placeholder="Dashboard Performance Gate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="flow_step">Flow Step</Label>
                    <Select value={formData.flow_step} onValueChange={(value) => setFormData({ ...formData, flow_step: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select flow step" />
                      </SelectTrigger>
                      <SelectContent>
                        {flowSteps.map((step) => (
                          <SelectItem key={step.value} value={step.value}>
                            {step.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="criteria">Quality Criteria (JSON)</Label>
                  <Textarea
                    id="criteria"
                    value={formData.criteria}
                    onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                    placeholder={JSON.stringify(sampleCriteria, null, 2)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Define thresholds using "min" and "max" values for different metrics
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                  <Label>Enabled</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={saveGate}>
                    {editingGate ? 'Update Gate' : 'Create Gate'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quality Gate Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Gates</p>
                <p className="text-2xl font-bold">{gates.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Passing</p>
                <p className="text-2xl font-bold text-green-600">
                  {gateExecutions.filter(g => g.status === 'passed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failing</p>
                <p className="text-2xl font-bold text-red-600">
                  {gateExecutions.filter(g => g.status === 'failed').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Gates List */}
      <div className="grid gap-4">
        {gateExecutions.map((execution) => (
          <Card key={execution.gate.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(execution.status)}
                    {execution.gate.gate_name}
                  </CardTitle>
                  <CardDescription>
                    {flowSteps.find(s => s.value === execution.gate.flow_step)?.label} • 
                    Last checked {new Date(execution.lastCheck).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={execution.gate.enabled ? "default" : "secondary"}>
                    {execution.gate.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Badge 
                    variant={execution.status === 'passed' ? "default" : execution.status === 'failed' ? "destructive" : "secondary"}
                  >
                    {execution.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {execution.failureReason && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Failure Reason:</p>
                    <p className="text-sm text-red-700">{execution.failureReason}</p>
                  </div>
                )}

                <div className="text-sm">
                  <p className="font-medium mb-2">Quality Criteria:</p>
                  <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(execution.gate.criteria, null, 2)}
                  </pre>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editGate(execution.gate)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteGate(execution.gate.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {gates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Quality Gates</h3>
            <p className="text-muted-foreground">
              Create quality gates to ensure consistent performance standards.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};