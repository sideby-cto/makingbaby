import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Clock, AlertTriangle, Database, Zap, MessageSquare, FileText, Users } from 'lucide-react';

interface TestExecution {
  id: string;
  test_name: string;
  test_type: string;
  status: string;
  duration_ms: number;
  started_at: string;
  completed_at: string;
  results: any;
  error_message?: string;
}

interface TestResultsDialogProps {
  execution: TestExecution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TestResultsDialog: React.FC<TestResultsDialogProps> = ({
  execution,
  open,
  onOpenChange
}) => {
  if (!execution) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
  };

  const getFlowStepIcon = (testType: string) => {
    switch (testType) {
      case 'dashboard_setup':
        return <Database className="h-4 w-4" />;
      case 'match_creation':
        return <Users className="h-4 w-4" />;
      case 'conversation':
        return <MessageSquare className="h-4 w-4" />;
      case 'output_generation':
        return <FileText className="h-4 w-4" />;
      case 'next_match':
        return <Zap className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const renderTestResults = () => {
    if (!execution.results) return null;

    switch (execution.test_type) {
      case 'dashboard_setup':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Endpoint Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {execution.results.endpoint_accessible ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {execution.results.endpoint_accessible ? 'Accessible' : 'Not Accessible'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Auth System</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {execution.results.auth_system_healthy ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {execution.results.auth_system_healthy ? 'Healthy' : 'Issues Detected'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Database Tables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(execution.results.database_tables || {}).map(([table, data]: [string, any]) => (
                    <div key={table} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{table}</span>
                      <div className="flex items-center gap-2">
                        {data.accessible ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <Badge variant="outline" className="text-xs">
                              {data.count} records
                            </Badge>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-600">{data.error}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'match_creation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Available Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{execution.results.available_profiles}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Table Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {execution.results.matches_table_accessible ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {execution.results.matches_table_accessible ? 'OK' : 'Error'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">System Ready</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {execution.results.matching_system_ready ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {execution.results.matching_system_ready ? 'Ready' : 'Not Ready'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'conversation':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Messaging Tables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(execution.results.messaging_tables || {}).map(([table, data]: [string, any]) => (
                    <div key={table} className="flex items-center justify-between">
                      <span className="text-sm">{table.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-2">
                        {data.accessible ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <Badge variant="outline" className="text-xs">
                              {data.count} messages
                            </Badge>
                          </>
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Realtime Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {execution.results.realtime_functional ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {execution.results.realtime_functional ? 'Functional' : 'Issues Detected'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(execution.results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFlowStepIcon(execution.test_type)}
            {execution.test_name} - Test Results
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Test Overview */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(execution.status)}
                    <Badge variant={
                      execution.status === 'passed' ? 'default' : 
                      execution.status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {execution.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">
                    {execution.duration_ms}ms
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {new Date(execution.started_at).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {execution.completed_at ? 
                      new Date(execution.completed_at).toLocaleTimeString() : 
                      'In Progress'
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Message */}
            {execution.error_message && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-sm text-red-600 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Error Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-50 p-3 rounded text-sm text-red-800">
                    {execution.error_message}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Results */}
            {renderTestResults()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};