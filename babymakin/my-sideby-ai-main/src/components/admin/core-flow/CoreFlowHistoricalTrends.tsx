import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const CoreFlowHistoricalTrends = () => {
  const { data: historicalData } = useQuery({
    queryKey: ['core-flow-historical'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('core_flow_test_executions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  const successRate = historicalData ? 
    Math.round((historicalData.filter(e => e.status === 'passed').length / historicalData.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Historical Trends</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Overall Success Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{successRate}%</div>
                <div className="text-sm text-muted-foreground">Historical Average</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Total Tests</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historicalData?.length || 0}</div>
            <div className="text-sm text-muted-foreground">All time</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {historicalData?.slice(0, 10).filter(e => e.status === 'passed').length || 0}/10
            </div>
            <div className="text-sm text-muted-foreground">Last 10 tests passed</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};