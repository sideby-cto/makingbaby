import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Database, 
  Cloud,
  Users,
  Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DataQualityMetrics {
  totalUsers: number;
  activeMatches: number;
  upduoTranscripts: number;
  recentSessions: number;
  syncHealth: 'excellent' | 'good' | 'poor' | 'critical';
}

export const DataQualityDashboard: React.FC = () => {
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['simplifiedDataQualityMetrics'],
    queryFn: async (): Promise<DataQualityMetrics> => {
      // Get all users with profiles (excluding admins)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .not('email', 'like', '%@sideby.ai');

      if (profilesError) throw profilesError;

      // Get active matches
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id')
        .eq('status', 'active');

      if (matchesError) throw matchesError;

      // Get transcript data
      const { data: transcripts, error: transcriptsError } = await supabase
        .from('upduo_transcripts')
        .select('id, created_at');

      if (transcriptsError) throw transcriptsError;

      // Calculate recent sessions (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentSessions = transcripts?.filter(t => 
        new Date(t.created_at) > sevenDaysAgo
      ).length || 0;

      // Calculate metrics
      const totalUsers = profiles?.length || 0;
      const activeMatches = matches?.length || 0;
      const upduoTranscripts = transcripts?.length || 0;

      // Determine sync health based on activity
      let syncHealth: DataQualityMetrics['syncHealth'] = 'excellent';
      const activityRate = totalUsers > 0 ? recentSessions / totalUsers : 0;
      
      if (activityRate < 0.1) {
        syncHealth = 'critical';
      } else if (activityRate < 0.3) {
        syncHealth = 'poor';
      } else if (activityRate < 0.6) {
        syncHealth = 'good';
      }

      return {
        totalUsers,
        activeMatches,
        upduoTranscripts,
        recentSessions,
        syncHealth
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000 // Auto-refresh every 10 minutes
  });

  const getHealthColor = (health: DataQualityMetrics['syncHealth']) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'poor': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (health: DataQualityMetrics['syncHealth']) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'poor': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Data Quality Metrics...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Metrics</CardTitle>
          <CardDescription>
            Unable to load data quality metrics. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activityRate = metrics.totalUsers > 0 ? (metrics.recentSessions / metrics.totalUsers) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Platform Activity Overview
              </CardTitle>
              <CardDescription>
                Simplified metrics for platform engagement and activity
              </CardDescription>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            {getHealthIcon(metrics.syncHealth)}
            <Badge 
              variant="outline" 
              className={`font-medium ${getHealthColor(metrics.syncHealth)}`}
            >
              Activity Level: {metrics.syncHealth.toUpperCase()}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.activeMatches}</div>
              <div className="text-sm text-gray-600">Active Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.upduoTranscripts}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.recentSessions}</div>
              <div className="text-sm text-gray-600">Recent Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Platform Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Recent Activity Rate</span>
                <span className="font-medium">{activityRate.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(activityRate, 100)} className="h-2" />
            </div>
            
            <div className="text-sm text-gray-600">
              <p>{metrics.recentSessions} sessions recorded in the last 7 days</p>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Matches</span>
                <Badge variant={metrics.activeMatches > 0 ? "default" : "secondary"}>
                  {metrics.activeMatches}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Sessions</span>
                <Badge variant={metrics.upduoTranscripts > 0 ? "default" : "secondary"}>
                  {metrics.upduoTranscripts}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Platform Health</span>
                <Badge variant="outline" className={getHealthColor(metrics.syncHealth)}>
                  {metrics.syncHealth}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};