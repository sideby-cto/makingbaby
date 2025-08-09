
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, User, Database, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ComprehensiveProfileEditor } from "@/components/configuration/ComprehensiveProfileEditor";
import { NotificationPreferencesForm } from "@/components/configuration/NotificationPreferencesForm";

import { DataAccountTab } from "@/components/settings/DataAccountTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";

const Settings = () => {
  const { profile, loading, refreshProfile } = useProfile();
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <DashboardLayout loading={loading}>
      <div className="space-y-8">
        
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-sideby-orange-400 to-sideby-burgundy-500 rounded-xl shadow-lg">
            <SettingsIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-sideby-text-primary tracking-tight">Settings</h1>
            <p className="text-sideby-text-secondary font-semibold">Customize your sideby experience</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-gradient-to-r from-sideby-orange-50 to-sideby-blue-50 border-2 border-sideby-orange-100 p-1 h-auto">
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-white data-[state=active]:text-sideby-text-primary data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-sideby-orange-200 font-semibold px-4 py-3 rounded-lg transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications"
              className="data-[state=active]:bg-white data-[state=active]:text-sideby-text-primary data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-sideby-orange-200 font-semibold px-4 py-3 rounded-lg transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="data-account"
              className="data-[state=active]:bg-white data-[state=active]:text-sideby-text-primary data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-sideby-orange-200 font-semibold px-4 py-3 rounded-lg transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data & Account
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {profile && (
              <ComprehensiveProfileEditor 
                profile={profile} 
                onProfileUpdate={refreshProfile}
              />
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-gradient-to-br from-white via-sideby-orange-50/30 to-sideby-blue-50/30 border-2 border-sideby-orange-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-sideby-orange-50 to-sideby-blue-50 border-b border-sideby-orange-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-sideby-orange-400 to-sideby-burgundy-500 rounded-lg shadow-md">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-sideby-text-primary tracking-wide">Notification Preferences</CardTitle>
                    <CardDescription className="text-sideby-text-secondary font-semibold">
                      Manage how you want to receive notifications
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {profile && <NotificationPreferencesForm profile={profile} />}
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="data-account" className="space-y-6">
            <DataAccountTab profile={profile} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
