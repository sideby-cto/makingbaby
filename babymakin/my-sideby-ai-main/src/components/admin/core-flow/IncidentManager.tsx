import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Plus, User, Clock, CheckCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CoreFlowIncident {
  id: string;
  test_name: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  detected_at: string;
  resolved_at?: string;
  error_message?: string;
  failure_count: number;
}

export const IncidentManager = () => {
  const [incidents, setIncidents] = useState<CoreFlowIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<CoreFlowIncident | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    flow_step: '',
    severity: '',
    title: '',
    description: '',
    assignee_id: ''
  });

  const severityOptions = [
    { value: 'low', label: 'Low', color: 'bg-blue-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'critical', label: 'Critical', color: 'bg-red-500' }
  ];

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const flowSteps = [
    'dashboard_setup',
    'match_creation',
    'conversation',
    'output_generation',
    'next_match'
  ];

  useEffect(() => {
    loadIncidents();
    
    // Set up real-time updates for test executions
    const channel = supabase
      .channel('core-flow-test-executions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'core_flow_test_executions' },
        () => loadIncidents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadIncidents = async () => {
    try {
      // Get tests with recent failures to create incidents
      const { data: tests, error } = await supabase
        .from('core_flow_tests')
        .select(`
          *,
          core_flow_test_executions!inner (
            status,
            started_at,
            error_message
          )
        `)
        .eq('core_flow_test_executions.status', 'failed')
        .order('core_flow_test_executions.started_at', { ascending: false });

      if (error) throw error;
      
      // Transform into incidents - group by test and count failures
      const incidentMap = new Map();
      
      tests?.forEach(test => {
        const key = test.test_name;
        if (!incidentMap.has(key)) {
          const latestExecution = test.core_flow_test_executions[0];
          incidentMap.set(key, {
            id: test.id,
            test_name: test.test_name,
            severity: test.critical ? 'critical' : 'medium',
            title: `Recurring Failures: ${test.test_name}`,
            description: `Test "${test.test_name}" has been failing repeatedly`,
            status: 'open',
            detected_at: latestExecution.started_at,
            error_message: latestExecution.error_message,
            failure_count: 1
          });
        } else {
          const incident = incidentMap.get(key);
          incident.failure_count += 1;
        }
      });
      
      setIncidents(Array.from(incidentMap.values()));
    } catch (error) {
      console.error('Error loading incidents:', error);
      toast({
        title: "Error",
        description: "Failed to load incidents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createIncident = async () => {
    toast({
      title: "Feature Coming Soon",
      description: "Manual incident creation will be available in the next version",
      variant: "default"
    });
    resetForm();
  };

  const markResolved = async (incidentId: string) => {
    // Since incidents are derived from test failures, mark as resolved locally
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === incidentId 
          ? { ...incident, status: 'resolved', resolved_at: new Date().toISOString() }
          : incident
      )
    );

    toast({
      title: "Success",
      description: "Incident marked as resolved"
    });
  };

  const rerunFailedTest = async (testName: string) => {
    try {
      // Find the test and create a new execution
      const { data: test } = await supabase
        .from('core_flow_tests')
        .select('id')
        .eq('test_name', testName)
        .single();

      if (test) {
        const { error } = await supabase
          .from('core_flow_test_executions')
          .insert({
            test_id: test.id,
            status: 'running',
            started_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "Test Restarted",
          description: `Test "${testName}" has been restarted`
        });
      }
    } catch (error) {
      console.error('Error rerunning test:', error);
      toast({
        title: "Error",
        description: "Failed to rerun test",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      flow_step: '',
      severity: '',
      title: '',
      description: '',
      assignee_id: ''
    });
    setIsCreateDialogOpen(false);
  };

  const getSeverityBadge = (severity: string) => {
    const option = severityOptions.find(s => s.value === severity);
    return (
      <Badge className={`${option?.color} text-white`}>
        {option?.label || severity}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'bg-red-500',
      investigating: 'bg-yellow-500',
      resolved: 'bg-green-500',
      closed: 'bg-gray-500'
    };
    
    return (
      <Badge className={`${colors[status as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="text-center">Loading incidents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Incident Management</h2>
          <p className="text-muted-foreground">
            Track and resolve issues affecting the core educator flow
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Incident
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Incident</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test_name">Test Name</Label>
                  <Input
                    id="test_name"
                    value={formData.flow_step}
                    onChange={(e) => setFormData({ ...formData, flow_step: e.target.value })}
                    placeholder="Enter test name"
                  />
                </div>
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {severityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the incident, steps to reproduce, and impact"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={createIncident}>
                  Create Incident
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Incident Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        {statusOptions.map((status) => {
          const count = incidents.filter(i => i.status === status.value).length;
          return (
            <Card key={status.value}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {status.label}
                    </p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  {getStatusBadge(status.value)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Incidents List */}
      <div className="grid gap-4">
        {incidents.map((incident) => (
          <Card key={incident.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {incident.title}
                  </CardTitle>
                  <CardDescription>
                    {incident.test_name} • 
                    {incident.failure_count} failure{incident.failure_count > 1 ? 's' : ''} • 
                    Latest: {new Date(incident.detected_at).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(incident.severity)}
                  {getStatusBadge(incident.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">{incident.description}</p>
                
                {incident.error_message && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Latest Error:</p>
                    <pre className="text-sm text-red-700 overflow-x-auto whitespace-pre-wrap">
                      {incident.error_message}
                    </pre>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {incident.failure_count} failure{incident.failure_count > 1 ? 's' : ''}
                    </div>
                    {incident.resolved_at && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Resolved {new Date(incident.resolved_at).toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.round((new Date().getTime() - new Date(incident.detected_at).getTime()) / (1000 * 60 * 60))}h ago
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {incident.status !== 'resolved' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rerunFailedTest(incident.test_name)}
                        >
                          Rerun Test
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => markResolved(incident.id)}
                        >
                          Mark Resolved
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {incidents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Incidents</h3>
            <p className="text-muted-foreground">
              The core flow is running smoothly with no reported incidents.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};