
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Users, Zap, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AutomaticMatchStats {
  totalMatches: number;
  completedMatches: number;
  autoCompletedMatches: number;
  recentAutoCompletions: Array<{
    id: string;
    user1_name: string;
    user2_name: string;
    completed_at: string;
    session_name: string;
  }>;
}

export const AutomaticMatchStatus = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["automaticMatchStats"],
    queryFn: async (): Promise<AutomaticMatchStats> => {
      // Get total matches
      const { data: allMatches, error: matchesError } = await supabase
        .from('matches')
        .select('id, status, completed_by, completed_at, upduo_session_name, user1:profiles!user1_id(first_name, last_name), user2:profiles!user2_id(first_name, last_name)')
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;

      const totalMatches = allMatches?.length || 0;
      const completedMatches = allMatches?.filter(m => m.status === 'completed').length || 0;
      const autoCompletedMatches = allMatches?.filter(m => 
        m.status === 'completed' && 
        (m.completed_by === 'automatic_system' || m.completed_by === 'upduo')
      ).length || 0;

      // Get recent auto-completions (last 10)
      const recentAutoCompletions = allMatches
        ?.filter(m => 
          m.status === 'completed' && 
          (m.completed_by === 'automatic_system' || m.completed_by === 'upduo')
        )
        .slice(0, 10)
        .map(m => ({
          id: m.id,
          user1_name: `${m.user1?.first_name || ''} ${m.user1?.last_name || ''}`.trim(),
          user2_name: `${m.user2?.first_name || ''} ${m.user2?.last_name || ''}`.trim(),
          completed_at: m.completed_at || '',
          session_name: m.upduo_session_name || 'sideby Session'
        })) || [];

      return {
        totalMatches,
        completedMatches,
        autoCompletedMatches,
        recentAutoCompletions
      };
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const autoCompletionRate = stats ? 
    stats.completedMatches > 0 ? Math.round((stats.autoCompletedMatches / stats.completedMatches) * 100) : 0 
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Automatic Match Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Automatic Match Completion
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats?.totalMatches || 0}</div>
            <div className="text-sm text-gray-600">Total Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats?.completedMatches || 0}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats?.autoCompletedMatches || 0}</div>
            <div className="text-sm text-gray-600">Auto-Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{autoCompletionRate}%</div>
            <div className="text-sm text-gray-600">Auto Rate</div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">System Active</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Monitoring sideby Sessions
          </Badge>
        </div>

        {/* Recent Auto-Completions */}
        {stats?.recentAutoCompletions && stats.recentAutoCompletions.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Auto-Completions
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.recentAutoCompletions.map((completion) => (
                <div key={completion.id} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-sm">
                        {completion.user1_name} + {completion.user2_name}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Auto
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {completion.session_name}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {new Date(completion.completed_at).toLocaleDateString()} at{' '}
                    {new Date(completion.completed_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information */}
        <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="font-medium text-blue-800 mb-1">How it works:</div>
          <ul className="space-y-1 text-blue-700">
            <li>• Monitors completed sideby sessions</li>
            <li>• Detects PAIR sessions with 2 participants</li>
            <li>• Automatically completes matching active matches</li>
            <li>• System tracks completion status</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
