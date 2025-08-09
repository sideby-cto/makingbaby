
import { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { ConfigurationView } from "@/components/configuration/ConfigurationView";
import { useProfile } from "@/hooks/useProfile";
import { Database, Sparkles } from "lucide-react";

const YourData = () => {
  const { profile, loading, refreshProfile } = useProfile();

  // Refresh profile data when page loads
  useEffect(() => {
    refreshProfile();

    // Set up a listener for refresh events
    const refreshHandler = () => {
      refreshProfile();
    };

    // Custom event for triggering profile refresh from child components
    window.addEventListener('profile-updated', refreshHandler);
    
    return () => {
      window.removeEventListener('profile-updated', refreshHandler);
    };
  }, [refreshProfile]);

  return (
    <DashboardLayout loading={loading}>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-sideby-blue-400 to-sideby-teal-500 rounded-xl shadow-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-sideby-text-primary tracking-tight">Your Data</h1>
            <p className="text-sideby-text-secondary font-semibold">View and manage your profile information</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-sideby-blue-50 via-white to-sideby-teal-50 rounded-xl p-6 border-2 border-dashed border-sideby-blue-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sideby-blue-400 to-sideby-teal-400"></div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-sideby-blue-500 mt-3"></div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sideby-blue-600" />
                <h3 className="text-lg font-bold text-sideby-text-primary tracking-wide">
                  Data Management
                </h3>
              </div>
              <p className="text-sideby-text-secondary font-medium leading-relaxed">
                This is your comprehensive data view. Here you can see all the information sideby has about you 
                and make updates as needed.
              </p>
            </div>
          </div>
        </div>
        
        <ConfigurationView profile={profile} refreshProfile={refreshProfile} showNotifications={false} />
      </div>
    </DashboardLayout>
  );
};

export default YourData;
