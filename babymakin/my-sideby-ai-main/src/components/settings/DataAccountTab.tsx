
import { Profile } from "@/types/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserProfileData } from "@/components/configuration/UserProfileData";
import { AccountDeletion } from "@/components/configuration/AccountDeletion";

interface DataAccountTabProps {
  profile: Profile | null;
}

export const DataAccountTab = ({ profile }: DataAccountTabProps) => {
  if (!profile) return null;

  return (
    <Tabs defaultValue="data" className="space-y-4">
      <TabsList>
        <TabsTrigger value="data">Your Data</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      
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
