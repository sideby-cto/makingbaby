
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useNotificationManagement() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningMonitor, setRunningMonitor] = useState(false);
  const [queueStats, setQueueStats] = useState<any>({
    pending: 0,
    sent: 0,
    failed: 0
  });
  
  const { toast } = useToast();

  // Load notification queue statistics
  const loadQueueStats = async () => {
    try {
      // Get pending notifications count
      const { data: pendingData, error: pendingError } = await supabase
        .from("pending_notifications")
        .select("id", { count: 'exact' })
        .eq("status", "pending");
        
      if (pendingError) throw pendingError;
      
      // Get sent notifications count
      const { data: sentData, error: sentError } = await supabase
        .from("notification_delivery_logs")
        .select("id", { count: 'exact' })
        .eq("success", true)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        
      if (sentError) throw sentError;
      
      // Get failed notifications count
      const { data: failedData, error: failedError } = await supabase
        .from("notification_delivery_logs")
        .select("id", { count: 'exact' })
        .eq("success", false)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        
      if (failedError) throw failedError;
      
      setQueueStats({
        pending: pendingData?.length || 0,
        sent: sentData?.length || 0,
        failed: failedData?.length || 0
      });
      
    } catch (error) {
      console.error("Error loading queue stats:", error);
    }
  };

  // Load stages and templates
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

      // Load templates
      const { data: templateData, error: templateError } = await supabase
        .from("journey_reminder_templates")
        .select("*")
        .order("stage", { ascending: true })
        .order("reminder_type", { ascending: true });

      if (templateError) throw templateError;
      setTemplates(templateData || []);
      
      // Load queue statistics
      await loadQueueStats();
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
      await loadQueueStats();
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
    setLoading(true);
    
    try {
      // Reload stages ordered by display_order
      const { data: stageData, error: stageError } = await supabase
        .from("journey_stage_config")
        .select("*")
        .is('deleted_at', null)
        .order('display_order', { ascending: true });

      if (stageError) throw stageError;
      
      setStages(stageData || []);

      // Reload templates
      const { data: templateData, error: templateError } = await supabase
        .from("journey_reminder_templates")
        .select("*")
        .order("stage", { ascending: true })
        .order("reminder_type", { ascending: true });

      if (templateError) throw templateError;
      setTemplates(templateData || []);
      
      // Refresh queue stats
      await loadQueueStats();
      
      toast({
        title: "Data Refreshed",
        description: "Notification settings have been refreshed",
      });
    } catch (error) {
      console.error("Error refreshing journey data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedStage,
    setSelectedStage,
    stages,
    templates,
    loading,
    runningMonitor,
    queueStats,
    loadData,
    refreshData,
    runJourneyMonitor
  };
}
