import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserJourneysList } from "./UserJourneysList";
import { UserJourneyKanban } from "./UserJourneyKanban";
import { NotificationManagementView } from "./notifications/NotificationManagementView";
import { JourneyDebugPanel } from "./debugging/JourneyDebugPanel";
import { JourneyStageSettings } from "./settings/JourneyStageSettings";
import { UserJourneyMetrics } from "./UserJourneyMetrics";
import { UserJourneyFilters } from "./UserJourneyFilters";
import { UserJourneyAnalyticsDashboard } from "../analytics/UserJourneyAnalyticsDashboard";
import { useUserJourneys } from "./hooks/useUserJourneys";

export const UserJourneysView: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedStage, setSelectedStage] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  
  const { journeys, loading, refetch } = useUserJourneys();

  const handleJourneyUpdate = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  // Calculate metrics from journeys data
  const metrics = {
    totalUsers: journeys.length,
    activeUsers: journeys.filter(j => j.stage === 'active').length,
    newUsers: journeys.filter(j => j.stage === 'new').length,
    completedReflections: journeys.filter(j => j.hasMatchActivity).length,
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <UserJourneyMetrics metrics={metrics} />
      
      {/* Filters */}
      <UserJourneyFilters
        selectedStage={selectedStage}
        searchQuery={searchQuery}
        dateRange={dateRange}
        onStageChange={setSelectedStage}
        onSearchChange={setSearchQuery}
        onDateRangeChange={setDateRange}
      />
      
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="settings">Stage Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="mt-6">
          <UserJourneyAnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="list" className="mt-6">
          <UserJourneysList
            key={refreshKey}
            journeys={journeys}
            loading={loading}
            onRefresh={handleJourneyUpdate}
            selectedStage={selectedStage}
            searchQuery={searchQuery}
            dateRange={dateRange}
          />
        </TabsContent>
        
        <TabsContent value="kanban" className="mt-6">
          <UserJourneyKanban
            initialJourneys={journeys}
            onJourneyUpdate={handleJourneyUpdate}
            selectedStage={selectedStage}
            searchQuery={searchQuery}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <JourneyStageSettings />
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <NotificationManagementView />
        </TabsContent>
        
        <TabsContent value="debug" className="mt-6">
          <JourneyDebugPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};