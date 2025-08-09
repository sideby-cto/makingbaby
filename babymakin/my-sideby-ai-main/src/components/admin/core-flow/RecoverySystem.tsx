import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Play, Pause, Settings, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RecoveryAction {
  id: string;
  test_id: string;
  action_type: string;
  action_script?: any;
  status: string;
  started_at?: string;
  completed_at?: string;
  results?: any;
  error_message?: string;
}

interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  flow_step: string;
}

export const RecoverySystem = () => {
  const [recoveryActions, setRecoveryActions] = useState<RecoveryAction[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [autoRecoveryEnabled, setAutoRecoveryEnabled] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    test_id: '',
    action_type: '',
    action_script: ''
  });

  const actionTypes = [
    { value: 'restart_service', label: 'Restart Service' },
    { value: 'rollback_deployment', label: 'Rollback Deployment' },
    { value: 'scale_resources', label: 'Scale Resources' },
    { value: 'clear_cache', label: 'Clear Cache' },
    { value: 'manual_intervention', label: 'Manual Intervention' }
  ];

  useEffect(() => {
    loadRecoveryActions();
    loadOpenIncidents();
    
    // Set up real-time updates for test executions
    const channel = supabase
      .channel('recovery-system')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'core_flow_test_executions' },
        () => loadRecoveryActions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRecoveryActions = async () => {
    try {
      // Recovery actions will be integrated in next version
      setRecoveryActions([]);
    } catch (error) {
      console.error('Error loading recovery actions:', error);
      toast({
        title: "Error",
        description: "Failed to load recovery actions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadOpenIncidents = async () => {
    try {
      // Load failed tests as incidents
      const { data, error } = await supabase
        .from('core_flow_test_executions')
        .select(`
          *,
          core_flow_tests (
            test_name,
            critical
          )
        `)
        .eq('status', 'failed')
        .order('started_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      const incidents = data?.map(execution => ({
        id: execution.id,
        title: execution.core_flow_tests?.test_name || 'Unknown Test',
        severity: execution.core_flow_tests?.critical ? 'critical' : 'medium',
        status: 'open',
        flow_step: 'test_execution'
      })) || [];
      
      setIncidents(incidents);
    } catch (error) {
      console.error('Error loading incidents:', error);
    }
  };

  const createRecoveryAction = async () => {
    try {
      let actionScript = null;
      if (formData.action_script) {
        try {
          actionScript = JSON.parse(formData.action_script);
        } catch {
          toast({
            title: "Error",
            description: "Invalid JSON in action script",
            variant: "destructive"
          });
          return;
        }
      }

      // For now, log recovery actions as admin alerts
      const { error } = await supabase
        .from('admin_alerts')
        .insert({
          content: `Recovery action: ${formData.action_type} for test ${formData.test_id}`,
          status: 'pending',
          user_id: (await supabase.auth.getUser()).data.user?.id || '',
          match_id: formData.test_id // Using match_id to store test reference
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recovery action created successfully"
      });

      resetForm();
      loadRecoveryActions();
    } catch (error) {
      console.error('Error creating recovery action:', error);
      toast({
        title: "Error",
        description: "Failed to create recovery action",
        variant: "destructive"
      });
    }
  };

  const executeRecoveryAction = async (actionId: string) => {
    try {
      const { error } = await supabase.functions.invoke('execute-recovery-action', {
        body: { actionId }
      });

      if (error) throw error;

      toast({
        title: "Recovery Action Started",
        description: "Recovery action is being executed..."
      });
    } catch (error) {
      console.error('Error executing recovery action:', error);
      toast({
        title: "Error",
        description: "Failed to execute recovery action",
        variant: "destructive"
      });
    }
  };

  const triggerAutoRecovery = async () => {
    try {
      const { error } = await supabase.functions.invoke('trigger-auto-recovery', {
        body: { enabled: autoRecoveryEnabled }
      });

      if (error) throw error;

      toast({
        title: "Auto Recovery Updated",
        description: `Auto recovery ${autoRecoveryEnabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      console.error('Error updating auto recovery:', error);
      toast({
        title: "Error",
        description: "Failed to update auto recovery",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      test_id: '',
      action_type: '',
      action_script: ''
    });
    setIsCreateDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-gray-500',
      running: 'bg-blue-500',
      completed: 'bg-green-500',
      failed: 'bg-red-500'
    };
    
    return (
      <Badge className={`${colors[status as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const sampleActionScript = {
    service: "dashboard-api",
    steps: [
      { action: "stop_service", timeout: 30 },
      { action: "clear_logs" },
      { action: "start_service", timeout: 60 },
      { action: "health_check", retries: 3 }
    ]
  };

  if (isLoading) {
    return <div className="text-center">Loading recovery system...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recovery System</h2>
          <p className="text-muted-foreground">
            Automated and manual recovery actions for core flow incidents
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-recovery">Auto Recovery</Label>
            <button
              id="auto-recovery"
              onClick={() => {
                setAutoRecoveryEnabled(!autoRecoveryEnabled);
                triggerAutoRecovery();
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRecoveryEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRecoveryEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Settings className="h-4 w-4 mr-2" />
                Create Recovery Action
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Recovery Action</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="test_id">Failed Test</Label>
                    <Select value={formData.test_id} onValueChange={(value) => setFormData({ ...formData, test_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select failed test" />
                      </SelectTrigger>
                      <SelectContent>
                        {incidents.map((incident) => (
                          <SelectItem key={incident.id} value={incident.id}>
                            {incident.title} ({incident.severity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="action_type">Action Type</Label>
                    <Select value={formData.action_type} onValueChange={(value) => setFormData({ ...formData, action_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action type" />
                      </SelectTrigger>
                      <SelectContent>
                        {actionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="action_script">Action Script (JSON - Optional)</Label>
                  <Textarea
                    id="action_script"
                    value={formData.action_script}
                    onChange={(e) => setFormData({ ...formData, action_script: e.target.value })}
                    placeholder={JSON.stringify(sampleActionScript, null, 2)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Define automated steps for the recovery action
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={createRecoveryAction}>
                    Create Action
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Recovery Actions Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        {['pending', 'running', 'completed', 'failed'].map((status) => {
          const count = recoveryActions.filter(a => a.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground capitalize">
                      {status}
                    </p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  {getStatusIcon(status)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recovery Actions List */}
      <div className="grid gap-4">
        {recoveryActions.map((action) => {
          const incident = (action as any).core_flow_incidents;
          return (
            <Card key={action.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(action.status)}
                      {actionTypes.find(t => t.value === action.action_type)?.label}
                    </CardTitle>
                    <CardDescription>
                      {incident?.title} • {incident?.flow_step?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(action.status)}
                    <Badge variant="outline">
                      {incident?.severity}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {action.action_script && (
                    <div>
                      <p className="text-sm font-medium mb-2">Action Script:</p>
                      <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(action.action_script, null, 2)}
                      </pre>
                    </div>
                  )}

                  {action.error_message && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-800">Error:</p>
                      <p className="text-sm text-red-700">{action.error_message}</p>
                    </div>
                  )}

                  {action.results && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Results:</p>
                      <pre className="text-xs text-green-700 mt-1">
                        {JSON.stringify(action.results, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {action.started_at && (
                        <span>Started {new Date(action.started_at).toLocaleString()}</span>
                      )}
                      {action.completed_at && (
                        <span> • Completed {new Date(action.completed_at).toLocaleString()}</span>
                      )}
                      {action.started_at && action.completed_at && (
                        <span> • Duration: {Math.round((new Date(action.completed_at).getTime() - new Date(action.started_at).getTime()) / 1000)}s</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {action.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => executeRecoveryAction(action.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Execute
                        </Button>
                      )}
                      {action.status === 'running' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Running
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recoveryActions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Recovery Actions</h3>
            <p className="text-muted-foreground">
              Recovery actions will appear here when incidents require intervention.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};