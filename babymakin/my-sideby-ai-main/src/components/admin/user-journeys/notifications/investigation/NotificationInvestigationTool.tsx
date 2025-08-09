
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Clock, Mail, Database, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InvestigationResult {
  step: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  data?: any;
  details?: string[];
}

export function NotificationInvestigationTool() {
  const [investigating, setInvestigating] = useState(false);
  const [results, setResults] = useState<InvestigationResult[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const runFullInvestigation = async () => {
    setInvestigating(true);
    setResults([]);
    
    const investigationSteps = [
      checkPendingNotifications,
      checkJourneyReminderTemplates,
      checkEmailTemplateIntegration,
      checkNotificationDeliveryLogs,
      checkJourneyMonitorFunction,
      testEmailSendingPipeline
    ];

    for (const step of investigationSteps) {
      try {
        const result = await step();
        setResults(prev => [...prev, result]);
      } catch (error) {
        setResults(prev => [...prev, {
          step: step.name,
          status: 'error',
          message: `Failed to execute: ${error.message}`,
          details: [error.stack]
        }]);
      }
    }

    setInvestigating(false);
  };

  const checkPendingNotifications = async (): Promise<InvestigationResult> => {
    console.log("Checking pending notifications...");
    
    const { data: pending, error } = await supabase
      .from('pending_notifications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const journeyNotifications = pending?.filter(n => 
      n.notification_type === 'journey_transition' || 
      n.notification_type === 'journey_stage_change'
    ) || [];

    return {
      step: "Pending Notifications Check",
      status: pending?.length > 0 ? 'warning' : 'success',
      message: `Found ${pending?.length || 0} pending notifications (${journeyNotifications.length} journey-related)`,
      data: { total: pending?.length || 0, journey: journeyNotifications.length },
      details: journeyNotifications.slice(0, 5).map(n => 
        `${n.channel}: ${n.title} (created: ${new Date(n.created_at).toLocaleString()})`
      )
    };
  };

  const checkJourneyReminderTemplates = async (): Promise<InvestigationResult> => {
    console.log("Checking journey reminder templates...");
    
    const { data: templates, error } = await supabase
      .from('journey_reminder_templates')
      .select('*')
      .eq('active', true);

    if (error) throw error;

    const templatesWithEmailId = templates?.filter(t => t.email_template_id) || [];
    const legacyTemplates = templates?.filter(t => !t.email_template_id && t.subject) || [];

    return {
      step: "Journey Reminder Templates",
      status: templates?.length > 0 ? 'success' : 'warning',
      message: `Found ${templates?.length || 0} active templates (${templatesWithEmailId.length} using centralized email, ${legacyTemplates.length} legacy)`,
      data: { total: templates?.length || 0, centralized: templatesWithEmailId.length, legacy: legacyTemplates.length },
      details: templates?.map(t => 
        `${t.stage} - ${t.reminder_type}: ${t.email_template_id ? 'Centralized' : 'Legacy'} (active: ${t.active})`
      ) || []
    };
  };

  const checkEmailTemplateIntegration = async (): Promise<InvestigationResult> => {
    console.log("Checking email template integration...");
    
    const { data: emailTemplates, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('status', 'active');

    if (error) throw error;

    const journeyTemplates = emailTemplates?.filter(t => 
      t.template_key?.includes('journey') || 
      t.name?.toLowerCase().includes('journey') ||
      t.account_type === 'notifications'
    ) || [];

    return {
      step: "Email Template Integration",
      status: journeyTemplates.length > 0 ? 'success' : 'warning',
      message: `Found ${emailTemplates?.length || 0} active email templates (${journeyTemplates.length} journey-related)`,
      data: { total: emailTemplates?.length || 0, journey: journeyTemplates.length },
      details: journeyTemplates.map(t => 
        `${t.name} (${t.template_key}) - ${t.account_type}`
      )
    };
  };

  const checkNotificationDeliveryLogs = async (): Promise<InvestigationResult> => {
    console.log("Checking notification delivery logs...");
    
    const { data: logs, error } = await supabase
      .from('notification_delivery_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const emailLogs = logs?.filter(l => l.channel === 'email') || [];
    const successfulEmails = emailLogs.filter(l => l.success);
    const failedEmails = emailLogs.filter(l => !l.success);

    return {
      step: "Notification Delivery Logs",
      status: emailLogs.length > 0 ? (failedEmails.length > successfulEmails.length ? 'error' : 'success') : 'warning',
      message: `Found ${emailLogs.length} email delivery attempts (${successfulEmails.length} successful, ${failedEmails.length} failed)`,
      data: { total: emailLogs.length, successful: successfulEmails.length, failed: failedEmails.length },
      details: [
        ...failedEmails.slice(0, 3).map(l => `Failed: ${l.error || 'Unknown error'}`),
        ...successfulEmails.slice(0, 2).map(l => `Success: ${l.channel} delivery`)
      ]
    };
  };

  const checkJourneyMonitorFunction = async (): Promise<InvestigationResult> => {
    console.log("Testing journey monitor function...");
    
    try {
      const { data, error } = await supabase.rpc('trigger_journey_monitor', { force_run: true });

      if (error) throw error;

      return {
        step: "Journey Monitor Function",
        status: 'success',
        message: "Journey monitor function executed successfully",
        data: data,
        details: [
          `Response: ${JSON.stringify(data)}`,
          "Function is accessible and responding"
        ]
      };
    } catch (error) {
      return {
        step: "Journey Monitor Function",
        status: 'error',
        message: `Journey monitor function failed: ${error.message}`,
        details: [
          "This function should process journey events and create notifications",
          "Check edge function logs for more details"
        ]
      };
    }
  };

  const testEmailSendingPipeline = async (): Promise<InvestigationResult> => {
    console.log("Testing email sending pipeline...");
    
    // Check if there are email accounts configured
    const { data: emailAccounts, error: accountsError } = await supabase
      .from('email_accounts')
      .select('*');

    if (accountsError) throw accountsError;

    const notificationAccounts = emailAccounts?.filter(a => a.account_type === 'notifications') || [];

    // Check recent email send logs
    const { data: sendLogs, error: logsError } = await supabase
      .from('email_send_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) throw logsError;

    const recentSends = sendLogs?.length || 0;
    const successfulSends = sendLogs?.filter(l => l.status === 'sent').length || 0;

    return {
      step: "Email Sending Pipeline",
      status: notificationAccounts.length > 0 ? 'success' : 'error',
      message: `${notificationAccounts.length} notification email accounts configured. ${recentSends} emails attempted in last 24h (${successfulSends} successful)`,
      data: { 
        accounts: notificationAccounts.length, 
        recentSends, 
        successfulSends 
      },
      details: [
        ...notificationAccounts.map(a => `Account: ${a.from_name} <${a.from_email}>`),
        ...(sendLogs?.slice(0, 3).map(l => `${l.status}: ${l.subject} to ${l.recipient_email}`) || [])
      ]
    };
  };

  const fixProcessingIssues = async () => {
    try {
      setInvestigating(true);
      
      // Try to process pending notifications
      const { data, error } = await supabase.functions.invoke('process-notification-digests', {
        body: { force_process: true }
      });

      if (error) throw error;

      toast({
        title: "Processing Triggered",
        description: "Attempted to process pending notifications",
      });

      // Refresh investigation
      await runFullInvestigation();
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setInvestigating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "default",
      warning: "secondary", 
      error: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notification System Investigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={runFullInvestigation} disabled={investigating}>
              <Database className="h-4 w-4 mr-2" />
              {investigating ? "Investigating..." : "Run Full Investigation"}
            </Button>
            <Button onClick={fixProcessingIssues} disabled={investigating} variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Try Fix Processing
            </Button>
          </div>

          {results.length > 0 && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {results.map((result, index) => (
                  <Alert key={index} className={result.status === 'error' ? 'border-red-200' : result.status === 'warning' ? 'border-yellow-200' : 'border-green-200'}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {getStatusIcon(result.status)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <strong>{result.step}</strong>
                            {getStatusBadge(result.status)}
                          </div>
                          <AlertDescription>{result.message}</AlertDescription>
                        </div>
                      </div>
                    </div>
                  </Alert>
                ))}
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                {results.map((result, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        {result.step}
                        {getStatusBadge(result.status)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-3">{result.message}</p>
                      {result.data && (
                        <pre className="bg-gray-50 p-2 rounded text-xs mb-3">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      )}
                      {result.details && result.details.length > 0 && (
                        <div>
                          <strong className="text-sm">Details:</strong>
                          <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                            {result.details.map((detail, i) => (
                              <li key={i}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="recommendations" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recommended Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>If you see pending notifications not being processed:</strong>
                        <ul className="list-disc list-inside mt-2 text-sm">
                          <li>Check if the process-notification-digests edge function exists and is working</li>
                          <li>Verify email accounts are configured for 'notifications' type</li>
                          <li>Check Supabase edge function logs for errors</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>If journey templates aren't using centralized email:</strong>
                        <ul className="list-disc list-inside mt-2 text-sm">
                          <li>Create email templates in the centralized system</li>
                          <li>Update journey templates to reference email_template_id</li>
                          <li>Migrate legacy templates using the migration function</li>
                        </ul>
                      </AlertDescription>
                    </Alert>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>If the journey monitor isn't creating notifications:</strong>
                        <ul className="list-disc list-inside mt-2 text-sm">
                          <li>Check recent user_journey_events table entries</li>
                          <li>Verify the journey-monitor edge function is deployed</li>
                          <li>Test manual trigger of the journey monitor</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
