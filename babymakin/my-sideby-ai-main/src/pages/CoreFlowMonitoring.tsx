
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { CoreFlowHealthDashboard } from '@/components/admin/core-flow/CoreFlowHealthDashboard';
import { FlowTestManager } from '@/components/admin/core-flow/FlowTestManager';
import { IncidentManager } from '@/components/admin/core-flow/IncidentManager';
import { QualityGatesManager } from '@/components/admin/core-flow/QualityGatesManager';
import { RecoverySystem } from '@/components/admin/core-flow/RecoverySystem';
import { FlowAlertsCenter } from '@/components/admin/core-flow/FlowAlertsCenter';
import { CoreFlowHowTo } from '@/components/admin/core-flow/CoreFlowHowTo';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Activity, TrendingUp, Settings } from 'lucide-react';

const CoreFlowMonitoring = () => {
  const [activeTab, setActiveTab] = useState('health');

  // Fetch critical alerts for header notification
  const { data: criticalAlerts } = useQuery({
    queryKey: ['critical-alerts'],
    queryFn: async () => {
      // Critical alerts derived from failed tests
      const { data, error } = await supabase
        .from('core_flow_test_executions')
        .select('id')
        .eq('status', 'failed')
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Fetch recent test failures
  const { data: recentFailures } = useQuery({
    queryKey: ['recent-test-failures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('core_flow_test_executions')
        .select(`
          id,
          status,
          started_at,
          core_flow_tests (
            test_name,
            critical
          )
        `)
        .eq('status', 'failed')
        .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000 // Refetch every minute
  });

  const criticalFailures = recentFailures?.filter(f => f.core_flow_tests?.critical) || [];
  const hasCriticalIssues = (criticalAlerts?.length || 0) > 0 || criticalFailures.length > 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Core Flow Monitoring</h1>
            <p className="text-muted-foreground">
              Comprehensive monitoring and testing of the core educator experience flow
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasCriticalIssues && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {(criticalAlerts?.length || 0) + criticalFailures.length} Critical Issues
              </Badge>
            )}
            <Badge variant="outline" className="text-sm">
              <Activity className="w-4 h-4 mr-1" />
              Mission Critical System
            </Badge>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Health Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-800">
                Real-time metrics and historical trends for all core flows
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="w-4 h-4 text-green-600" />
                Automated Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-800">
                Backend, frontend, and load testing with automated execution
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-purple-600" />
                Smart Alerting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-purple-800">
                Intelligent alerts with automatic escalation and recovery
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                Quality Gates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-orange-800">
                Automated quality checks preventing problematic deployments
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Health Dashboard
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Flow Tests
            </TabsTrigger>
            <TabsTrigger value="incidents" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Incidents
              {criticalFailures.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {criticalFailures.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Quality Gates
            </TabsTrigger>
            <TabsTrigger value="recovery">Recovery</TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              Alerts
              {(criticalAlerts?.length || 0) > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {criticalAlerts?.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="howto">How-To Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-4">
            <CoreFlowHealthDashboard />
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            <FlowTestManager />
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <IncidentManager />
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <QualityGatesManager />
          </TabsContent>

          <TabsContent value="recovery" className="space-y-4">
            <RecoverySystem />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <FlowAlertsCenter />
          </TabsContent>

          <TabsContent value="howto" className="space-y-4">
            <CoreFlowHowTo />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default CoreFlowMonitoring;
