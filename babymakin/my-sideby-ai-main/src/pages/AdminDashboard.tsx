
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { UpduoSessionsDialog } from "@/components/admin/dashboard/components/UpduoSessionsDialog";
import { generateTimePeriodsData } from "@/utils/timePeriodsGenerator";
import { TimePeriod } from "@/utils/timePeriodsGenerator";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { AdminTabNav } from "@/components/admin/dashboard/AdminTabNav";
import { AdminIdeasTab } from "@/components/admin/dashboard/tabs/AdminIdeasTab";
import { AdminMatchesTab } from "@/components/admin/dashboard/tabs/AdminMatchesTab";
import { AdminLearningTab } from "@/components/admin/dashboard/tabs/AdminLearningTab";
import { AdminDiagnosticsTab } from "@/components/admin/dashboard/tabs/AdminDiagnosticsTab";
import { AdminUpduoPanel } from "@/components/admin/dashboard/AdminUpduoPanel";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "@phosphor-icons/react";

const AdminDashboard = () => {
  console.log("AdminDashboard component is rendering");
  
  const [showUpduoSessions, setShowUpduoSessions] = useState(false);
  const [activeTab, setActiveTab] = useState("ideas");
  const timePeriodsData = generateTimePeriodsData();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  
  useEffect(() => {
    console.log("AdminDashboard mounted successfully");
  }, []);
  
  // Empty handlers for process gaps since they're not needed anymore
  const handleAddGap = async (description: string) => {
    console.log("Process gaps functionality removed");
  };
  
  const handleCloseGap = async (gapId: string) => {
    console.log("Process gaps functionality removed");
  };
  
  return (
    <AdminLayout>
      <div 
        className="flex flex-col container py-8 space-y-8 bg-semantic-background"
        data-testid="admin-dashboard-page"
      >
        {/* Header Section */}
        <div 
          className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between"
          data-testid="dashboard-header"
        >
          <div className="flex flex-col space-y-3" data-testid="header-content">
            <h1 
              className="text-display-md text-semantic-text-primary font-sans"
              data-testid="dashboard-title"
            >
              Team Dashboard
            </h1>
            <p 
              className="text-body-lg text-semantic-text-secondary max-w-2xl"
              data-testid="dashboard-description"
            >
              Manage and monitor all aspects of the sideby platform, including crews like the
              <span className="font-medium text-semantic-text-primary"> Gates </span> crew.
            </p>
          </div>
          <Button 
            asChild 
            className="mt-4 md:mt-0 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
            data-testid="create-crew-button"
          >
            <Link to="/admin/crews" className="flex items-center gap-2">
              <Plus size={20} weight="regular" />
              Create a Crew
            </Link>
          </Button>
        </div>

        {/* Tab Navigation */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
          data-testid="dashboard-tabs"
        >
          <AdminTabNav 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            data-testid="dashboard-tab-nav"
          />

          <div className="mt-8" data-testid="tab-content-container">
            <TabsContent 
              value="ideas" 
              className="mt-0 space-y-0"
              data-testid="ideas-tab-content"
            >
              <AdminIdeasTab />
            </TabsContent>

            <TabsContent 
              value="matches" 
              className="mt-0 space-y-0"
              data-testid="matches-tab-content"
            >
              <AdminMatchesTab />
            </TabsContent>

            <TabsContent 
              value="learning" 
              className="mt-0 space-y-0"
              data-testid="learning-tab-content"
            >
              <AdminLearningTab 
                timePeriod={timePeriod} 
                setTimePeriod={setTimePeriod} 
                timePeriodsData={timePeriodsData} 
                setShowUpduoSessions={setShowUpduoSessions} 
              />
            </TabsContent>

            <TabsContent 
              value="upduo" 
              className="mt-0 space-y-0"
              data-testid="upduo-tab-content"
            >
              <AdminUpduoPanel />
            </TabsContent>

            <TabsContent 
              value="diagnostics" 
              className="mt-0 space-y-0"
              data-testid="diagnostics-tab-content"
            >
              <AdminDiagnosticsTab />
            </TabsContent>
          </div>
        </Tabs>

        {/* Dialogs */}
        {showUpduoSessions && (
          <UpduoSessionsDialog 
            open={showUpduoSessions} 
            onOpenChange={setShowUpduoSessions}
            data-testid="upduo-sessions-dialog"
          />
        )}
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default AdminDashboard;
