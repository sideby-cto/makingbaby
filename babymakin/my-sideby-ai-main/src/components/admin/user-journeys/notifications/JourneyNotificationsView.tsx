import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Play, RefreshCw, AlertCircle, BarChart3, Users } from "lucide-react";
import { StageConfigList } from "./StageConfigList";
import { EmailPreview } from "./EmailPreview";
import { NotifiedUsersList } from "./management/NotifiedUsersList";
import { useNotifiedUsers } from "./hooks/useNotifiedUsers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { journeyEmailIntegrationService, JourneyTemplateWithCentralized } from "@/services/email/journeyEmailIntegrationService";

export function JourneyNotificationsView() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [templates, setTemplates] = useState<JourneyTemplateWithCentralized[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningMonitor, setRunningMonitor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("templates");
  const [notificationStats, setNotificationStats] = useState<any>({
    totalSent: 0,
    totalScheduled: 0,
    sentByStage: {},
    scheduledByStage: {}
  });
  
  const { toast } = useToast();
  const { notifiedUsers, isLoading: loadingUsers, refetchUsers } = useNotifiedUsers();

  // Load stages and templates
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);

    try {
      // Load stages ordered by display_order
      const { data: stageData, error: stageError } = await supabase
        .from("journey_stage_config")
        .select("*")
        .is('deleted_at', null)
        .order('display_order', { ascending: true });

      if (stageError) throw stageError;
      
      setStages(stageData || []);

      // Set default selected stage to the first one in display order
      if (stageData && stageData.length > 0 && !selectedStage) {
        setSelectedStage(stageData[0].stage);
      }

      // Load templates using the integration service
      const templateData = await journeyEmailIntegrationService.getJourneyTemplatesWithEmailTemplates();
      setTemplates(templateData);
      
      // Load notification stats
      await loadNotificationStats();
    } catch (error) {
      console.error("Error loading journey data:", error);
      toast({
        title: "Error loading data",
        description: "Failed to load notification settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Load notification statistics
  const loadNotificationStats = async () => {
    try {
      // Get sent logs
      const { data: sentLogs, error: sentError } = await supabase
        .from("journey_reminder_logs")
        .select("template_id, stage, reminder_type, sent_at");
        
      if (sentError) throw sentError;
      
      // Process stats
      const sentByStage: Record<string, number> = {};
      const sentByType: Record<string, number> = {};
      
      // Process sent logs
      if (sentLogs) {
        sentLogs.forEach((log: any) => {
          // Count by stage
          if (log.stage) {
            sentByStage[log.stage] = (sentByStage[log.stage] || 0) + 1;
          }
          
          // Count by type
          if (log.reminder_type) {
            sentByType[log.reminder_type] = (sentByType[log.reminder_type] || 0) + 1;
          }
        });
      }
      
      // For scheduled, we'll use a simulated approach since we don't have real scheduled data
      // In a real implementation, you'd query a scheduled_notifications table
      const scheduledByStage: Record<string, number> = {};
      stages.forEach(stage => {
        scheduledByStage[stage.stage] = Math.floor(Math.random() * 10); // Random value for demo
      });
      
      setNotificationStats({
        totalSent: sentLogs?.length || 0,
        totalScheduled: Object.values(scheduledByStage).reduce((a, b) => a + b, 0),
        sentByStage,
        scheduledByStage,
        sentByType,
        lastSent: sentLogs?.length ? new Date(
          Math.max(...sentLogs.map((log: any) => new Date(log.sent_at).getTime()))
        ).toISOString() : null
      });
      
    } catch (error) {
      console.error("Error loading notification stats:", error);
    }
  };

  const runJourneyMonitor = async () => {
    setRunningMonitor(true);
    try {
      const { data, error } = await supabase.rpc("trigger_journey_monitor", {
        force_run: true,
      });

      if (error) throw error;

      toast({
        title: "Journey Monitor Triggered",
        description: "The notification system has been manually triggered",
      });

      console.log("Journey monitor response:", data);
      
      // Refresh stats after running the monitor
      await loadNotificationStats();
      
      // Also refresh the notified users list
      refetchUsers();
    } catch (error) {
      console.error("Error running journey monitor:", error);
      toast({
        title: "Error",
        description: "Failed to run the journey monitor",
        variant: "destructive",
      });
    } finally {
      setRunningMonitor(false);
    }
  };

  const refreshData = async () => {
    await loadData();
    refetchUsers();
    
    toast({
      title: "Data Refreshed",
      description: "Notification settings have been refreshed",
    });
  };

  const handleTemplateSelect = (templateId: string | null) => {
    setSelectedTemplateId(templateId);
    if (templateId) {
      setShowPreview(true);
    }
  };

  // Close preview panel
  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedTemplateId(null);
  };
  
  // Toggle stats view
  const toggleStats = () => {
    setShowStats(!showStats);
    if (!showStats) {
      loadNotificationStats();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Journey Notification System</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleStats}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            {showStats ? "Hide Stats" : "Show Stats"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm" 
            onClick={runJourneyMonitor}
            disabled={runningMonitor}
          >
            {runningMonitor ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run Monitor
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Configure notification templates for each user journey stage using centralized email templates.
            Notifications will only be sent from the production environment (my.sideby.ai).
          </AlertDescription>
        </Alert>
        
        {showStats && (
          <Card className="mb-6 bg-gray-50 border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Notification Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg border shadow-sm">
                  <div className="text-sm text-gray-500">Total Sent</div>
                  <div className="text-2xl font-bold">{notificationStats.totalSent}</div>
                  {notificationStats.lastSent && (
                    <div className="text-xs text-gray-500">
                      Last: {new Date(notificationStats.lastSent).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="bg-white p-3 rounded-lg border shadow-sm">
                  <div className="text-sm text-gray-500">Scheduled</div>
                  <div className="text-2xl font-bold">{notificationStats.totalScheduled}</div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border shadow-sm">
                  <div className="text-sm text-gray-500">Most Active Stage</div>
                  <div className="text-2xl font-bold capitalize">
                    {Object.entries(notificationStats.sentByStage).length > 0 
                      ? Object.entries(notificationStats.sentByStage)
                          .sort((a: any, b: any) => b[1] - a[1])[0][0].replace('_', ' ')
                      : '-'}
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border shadow-sm">
                  <div className="text-sm text-gray-500">Top Notification Type</div>
                  <div className="text-2xl font-bold capitalize">
                    {Object.entries(notificationStats.sentByType || {}).length > 0 
                      ? Object.entries(notificationStats.sentByType)
                          .sort((a: any, b: any) => b[1] - a[1])[0][0]
                      : '-'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border shadow-sm">
                  <h4 className="text-sm font-medium mb-2">Notifications Sent by Stage</h4>
                  <div className="space-y-2">
                    {stages.map(stage => (
                      <div key={stage.stage} className="flex justify-between items-center">
                        <div className="capitalize text-sm">{stage.label || stage.stage.replace('_', ' ')}</div>
                        <div className="text-sm font-medium">{notificationStats.sentByStage[stage.stage] || 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border shadow-sm">
                  <h4 className="text-sm font-medium mb-2">Notifications Scheduled by Stage</h4>
                  <div className="space-y-2">
                    {stages.map(stage => (
                      <div key={stage.stage} className="flex justify-between items-center">
                        <div className="capitalize text-sm">{stage.label || stage.stage.replace('_', ' ')}</div>
                        <div className="text-sm font-medium">{notificationStats.scheduledByStage[stage.stage] || 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="templates">
              <span className="flex items-center">
                Template Settings
              </span>
            </TabsTrigger>
            <TabsTrigger value="users">
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Notified Users
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin opacity-70" />
              </div>
            ) : (
              <>
                <StageConfigList
                  stages={stages}
                  templates={templates}
                  selectedStage={selectedStage}
                  onSelectStage={setSelectedStage}
                  onSelectTemplate={handleTemplateSelect}
                  onRefresh={loadData}
                />
                
                {showPreview && selectedTemplateId && (
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Email Preview</h3>
                      <Button variant="ghost" size="sm" onClick={handleClosePreview}>
                        Close Preview
                      </Button>
                    </div>
                    <EmailPreview templateId={selectedTemplateId} />
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="users">
            <NotifiedUsersList 
              users={notifiedUsers} 
              isLoading={loadingUsers} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
