
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { NotificationQueueStatus } from "./management/NotificationQueueStatus";
import { NotificationManagementHeader } from "./management/NotificationManagementHeader";
import { NotificationTemplatesSection } from "./management/NotificationTemplatesSection";
import { NotificationTemplateDialog } from "./NotificationTemplateDialog";
import { NotificationInvestigation } from "./investigation";
import { useNotificationManagement } from "./hooks/useNotificationManagement";
import { useTemplateDialog } from "./hooks/useTemplateDialog";

export function NotificationManagementView() {
  const {
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
  } = useNotificationManagement();

  const {
    editingTemplateId,
    createDialogOpen,
    handleEditTemplate,
    handleViewTemplate,
    handleCreateTemplate,
    handleCloseEditDialog
  } = useTemplateDialog();

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const getTemplateById = (templateId: string) => {
    return templates.find(t => t.id === templateId) || null;
  };

  const onCloseDialog = (refreshNeeded = false) => {
    const shouldRefresh = handleCloseEditDialog(refreshNeeded);
    if (shouldRefresh) {
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="management" className="w-full">
        <TabsList>
          <TabsTrigger value="management">Template Management</TabsTrigger>
          <TabsTrigger value="investigation">Investigation & Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="management">
          <Card className="w-full">
            <NotificationManagementHeader
              loading={loading}
              runningMonitor={runningMonitor}
              onRefresh={refreshData}
              onProcessNotifications={runJourneyMonitor}
            />
            <CardContent>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Manage notification templates and view the notification queue status.
                  Process notifications to send pending items.
                </AlertDescription>
              </Alert>
              
              <NotificationQueueStatus stats={queueStats} />
              
              <NotificationTemplatesSection
                stages={stages}
                selectedStage={selectedStage}
                templates={templates}
                loading={loading}
                onSelectStage={setSelectedStage}
                onCreateTemplate={handleCreateTemplate}
                onEditTemplate={handleEditTemplate}
                onViewTemplate={handleViewTemplate}
                onRefresh={refreshData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investigation">
          <NotificationInvestigation />
        </TabsContent>
      </Tabs>

      {createDialogOpen && (
        <NotificationTemplateDialog
          open={createDialogOpen}
          onOpenChange={(open) => {
            if (!open) onCloseDialog();
          }}
          stage={selectedStage || ''}
          templateId={editingTemplateId}
          initialData={editingTemplateId ? getTemplateById(editingTemplateId) : null}
          onSuccess={() => onCloseDialog(true)}
          mode={editingTemplateId ? 'edit' : 'create'}
        />
      )}
    </div>
  );
}
