import { ExperimentsGrid } from "@/components/admin/experiments/ExperimentsGrid";
import { ExperimentSelector } from "@/components/admin/experiments/ExperimentSelector";
import { UnifiedExperimentDashboard } from "@/components/admin/experiments/UnifiedExperimentDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import type { Profile, ProfileSubjectStatus, NotificationPreferences } from "@/types/profile";
import { UpduoTranscriptManager } from "@/components/admin/dashboard/components/UpduoTranscriptManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LearningTimelineCard } from "@/components/admin/dashboard/components/LearningTimelineCard";
import { ViewAsSystemPanel } from "@/components/admin/view-as/ViewAsSystemPanel";
// import { UserMappingReviewPanel } from "@/components/admin/upduo/UserMappingReviewPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const AdminExperiments = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectableProfiles, setSelectableProfiles] = useState<{ id: string; name: string; email: string }[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState("view-as");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .not("first_name", "is", null)
        .neq("status", "deleted") // Exclude deleted users from initial fetch
        .order("first_name", { ascending: true });

      if (error) throw error;

      // Transform data to match Profile type
      const transformedData: Profile[] = data.map(item => {
        // Handle subject_statuses
        const subjectStatuses = item.subject_statuses
          ? (item.subject_statuses as any[]).map(status => 
              typeof status === 'object' 
                ? { name: status.name || '', status: status.status || '' } 
                : { name: '', status: '' }
            )
          : null;
          
        // Handle notification_preferences
        let notificationPrefs: NotificationPreferences | null = null;
        if (item.notification_preferences) {
          const np = item.notification_preferences as any;
          notificationPrefs = {
            email: typeof np.email === 'boolean' ? np.email : true,
            sms: typeof np.sms === 'boolean' ? np.sms : false,
            in_app: typeof np.in_app === 'boolean' ? np.in_app : true
          };
        }
        
        return {
          id: item.id,
          first_name: item.first_name,
          last_name: item.last_name,
          bio: item.bio,
          teaching_experience: item.teaching_experience,
          subjects: item.subjects,
          certifications: item.certifications,
          avatar_url: item.avatar_url,
          created_at: item.created_at,
          updated_at: item.updated_at,
          email: item.email,
          approved_stance: item.approved_stance,
          subject_statuses: subjectStatuses,
          status: item.status,
          deleted_at: item.deleted_at,
          phone_number: item.phone_number,
          notification_preferences: notificationPrefs,
          isAdmin: item.email?.endsWith('@sideby.ai')
        } as Profile;
      });

      // Extra filter to ensure no deleted users are included
      const activeUsers = transformedData.filter(user => user.status !== 'deleted');
      
      setUsers(activeUsers);
      setFilteredProfiles(activeUsers);
      
      // Create a list of selectable profiles for the dropdown, now including email
      setSelectableProfiles(
        activeUsers.map((user) => ({
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          email: user.email || ''
        }))
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          const deletedUserId = payload.old.id;
          
          // Update users list
          setUsers(prevUsers => prevUsers.filter(user => user.id !== deletedUserId));
          // Update selectable profiles
          setSelectableProfiles(prevProfiles => 
            prevProfiles.filter(profile => profile.id !== deletedUserId)
          );
          
          // If the deleted user was selected, clear the selection
          if (selectedUserId === deletedUserId) {
            setSelectedUserId(null);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: 'status=eq.deleted'
        },
        (payload) => {
          const deletedUserId = payload.new.id;
          
          // Update users list
          setUsers(prevUsers => prevUsers.filter(user => user.id !== deletedUserId));
          // Update selectable profiles
          setSelectableProfiles(prevProfiles => 
            prevProfiles.filter(profile => profile.id !== deletedUserId)
          );
          
          // If the deleted user was selected, clear the selection
          if (selectedUserId === deletedUserId) {
            setSelectedUserId(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUserId]);

  const sortedProfiles = useMemo(() => {
    return [...filteredProfiles].sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }, [filteredProfiles]);

  useEffect(() => {
    if (selectedUserId) {
      setFilteredProfiles(users.filter(user => user.id === selectedUserId));
    } else {
      setFilteredProfiles(users);
    }
  }, [selectedUserId, users]);

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Enhanced View As System</h1>
            <p className="text-muted-foreground">
              Comprehensive QA and user experience testing platform
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="experiment-hub">Experiment Hub</TabsTrigger>
            <TabsTrigger value="view-as">Enhanced View As</TabsTrigger>
            <TabsTrigger value="profiles">User Profiles</TabsTrigger>
            <TabsTrigger value="transcripts">Upduo Transcripts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="experiment-hub" className="space-y-8">
            <UnifiedExperimentDashboard />
          </TabsContent>
          
          <TabsContent value="view-as" className="space-y-8">
            <ViewAsSystemPanel
              selectedUserId={selectedUserId}
              onUserSelect={setSelectedUserId}
            />
          </TabsContent>
          
          <TabsContent value="profiles" className="space-y-8">
            {/* User Attribution Removed - System Simplified */}
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Simplified Session Management
              </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  User attribution system has been simplified. Sessions are now correlated based on timing and optional self-reporting.
                </p>
              </CardContent>
            </Card>

            {/* Existing User Profiles Section */}
            <Card>
              <CardHeader>
                <CardTitle>User Profile Experiments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4 xl:col-span-3 order-1 lg:order-2">
                    <div className="space-y-6 sticky top-4">
                      <ExperimentSelector 
                        profiles={selectableProfiles} 
                        selectedUserId={selectedUserId}
                        onSelect={setSelectedUserId}
                        loading={loading}
                      />
                      
                      {selectedUserId && (
                        <LearningTimelineCard userId={selectedUserId} />
                      )}
                    </div>
                  </div>
                  <div className="lg:col-span-8 xl:col-span-9 order-2 lg:order-1">
                    <ExperimentsGrid 
                      profiles={sortedProfiles} 
                      experimentType="stance" 
                      sortType="created_at"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transcripts">
            <UpduoTranscriptManager />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminExperiments;
