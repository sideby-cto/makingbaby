
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { ConfigurationView } from "@/components/configuration/ConfigurationView";

const Configuration = () => {
  const { profile, loading, refreshProfile } = useProfile();

  return (
    <DashboardLayout loading={loading}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Configuration</h1>
        <ConfigurationView 
          profile={profile} 
          refreshProfile={refreshProfile}
          showNotifications={true}
        />
      </div>
    </DashboardLayout>
  );
};

export default Configuration;
