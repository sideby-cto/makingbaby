import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Clock, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const CoreFlowRealTimeMetrics = () => {
  const { data: recentExecutions } = useQuery({
    queryKey: ['core-flow-realtime-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('core_flow_test_executions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000
  });

  const runningTests = recentExecutions?.filter(e => e.status === 'running').length || 0;
  const successRate = recentExecutions ? 
    Math.round((recentExecutions.filter(e => e.status === 'passed').length / recentExecutions.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{runningTests}</div>
                <div className="text-sm text-muted-foreground">Running Now</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{successRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{recentExecutions?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Recent Tests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};