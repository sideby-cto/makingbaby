
import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CompletionStats {
  total: number;
  automatic: number;
  manual: number;
  percentAutomatic: number;
}

export const MatchCompletionStats = () => {
  const [stats, setStats] = useState<CompletionStats>({ 
    total: 0, 
    automatic: 0, 
    manual: 0, 
    percentAutomatic: 0 
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get the completed matches with completed_by information
        const { data: completedMatches, error: completedError } = await supabase
          .from('matches')
          .select('id, completed_by, completion_notes')
          .eq('status', 'completed')
          .not('completed_at', 'is', null);
        
        if (completedError) {
          throw completedError;
        }
        
        if (!completedMatches) {
          setStats({ total: 0, automatic: 0, manual: 0, percentAutomatic: 0 });
          return;
        }
        
        // Count automatic completions vs manual completions
        // Automatic: completed_by is 'upduo', 'system', or contains automatic completion indicators
        const automatic = completedMatches.filter(match => {
          const completedBy = match.completed_by;
          const completionNotes = match.completion_notes || '';
          
          // Check for explicit automatic completion markers
          if (completedBy === 'upduo' || completedBy === 'system') {
            return true;
          }
          
          // Check for automatic completion in notes (for backward compatibility)
          if (completionNotes.toLowerCase().includes('automatically completed') ||
              completionNotes.toLowerCase().includes('upduo session')) {
            return true;
          }
          
          return false;
        }).length;
        
        const manual = completedMatches.length - automatic;
        const percentAutomatic = completedMatches.length > 0 
          ? Math.round((automatic / completedMatches.length) * 100) 
          : 0;
        
        setStats({
          total: completedMatches.length,
          automatic,
          manual,
          percentAutomatic
        });
        
        console.log('Match completion stats:', {
          total: completedMatches.length,
          automatic,
          manual,
          percentAutomatic
        });
      } catch (error) {
        console.error('Error fetching match completion stats:', error);
        toast({
          title: "Error loading stats",
          description: "Failed to load match completion statistics.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [toast]);

  const chartData = [
    { name: 'Automatic', value: stats.automatic, color: '#10B981' },
    { name: 'Manual', value: stats.manual, color: '#F59E0B' }
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Match Completion Stats</CardTitle>
        <CardDescription>
          Automatic vs manual match completions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[150px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading statistics...</p>
          </div>
        ) : stats.total === 0 ? (
          <div className="h-[150px] flex items-center justify-center">
            <p className="text-muted-foreground">No completed matches to display</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between text-sm">
                <span>Automatic completions</span>
                <span className="font-medium">{stats.percentAutomatic}%</span>
              </div>
              <Progress value={stats.percentAutomatic} className="h-2" />
            </div>
            
            <div className="h-[140px] mx-auto max-w-[300px]">
              <PieChart width={300} height={140}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={50}
                  dataKey="value"
                  nameKey="name"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="bg-muted rounded-md p-3">
                <p className="text-sm font-medium">Total Completions</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-muted rounded-md p-3">
                <p className="text-sm font-medium">Automatic Ratio</p>
                <p className="text-xl font-bold">{stats.automatic}:{stats.manual}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
