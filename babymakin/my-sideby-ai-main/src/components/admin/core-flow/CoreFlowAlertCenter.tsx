import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const CoreFlowAlertCenter = () => {
  const { data: recentFailures } = useQuery({
    queryKey: ['core-flow-test-failures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('core_flow_test_executions')
        .select(`
          *,
          core_flow_tests!inner (
            test_name,
            critical
          )
        `)
        .eq('status', 'failed')
        .order('started_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const criticalFailures = recentFailures?.filter(f => f.core_flow_tests?.critical) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Test Failure Alerts</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Critical Failures</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {criticalFailures.length > 0 ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              <div>
                <div className="text-2xl font-bold">{criticalFailures.length}</div>
                <div className="text-sm text-muted-foreground">
                  {criticalFailures.length === 0 ? 'All Good' : 'Need Attention'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Total Failures</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentFailures?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Recent failures</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};