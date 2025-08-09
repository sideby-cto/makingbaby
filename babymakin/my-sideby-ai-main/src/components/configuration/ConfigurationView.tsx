
import { Profile } from "@/types/profile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ComprehensiveProfileEditor } from "./ComprehensiveProfileEditor";
import { UserProfileData } from "./UserProfileData";
import { AccountDeletion } from "./AccountDeletion";
import { NotificationPreferencesForm } from "./NotificationPreferencesForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ConfigurationViewProps {
  profile: Profile | null;
  refreshProfile: () => void;
  showNotifications?: boolean;
}

export const ConfigurationView = ({ 
  profile, 
  refreshProfile, 
  showNotifications = true 
}: ConfigurationViewProps) => {
  if (!profile) return null;

  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        {showNotifications && <TabsTrigger value="notifications">Notifications</TabsTrigger>}
        <TabsTrigger value="data">Your Data</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile" className="space-y-6">
        <ComprehensiveProfileEditor 
          profile={profile} 
          onProfileUpdate={refreshProfile}
        />
      </TabsContent>

      {showNotifications && (
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationPreferencesForm profile={profile} />
            </CardContent>
          </Card>
        </TabsContent>
      )}

      <TabsContent value="data" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Data</CardTitle>
            <CardDescription>
              View and download all data associated with your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserProfileData profile={profile} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="account" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Account Deletion</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountDeletion profile={profile} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
