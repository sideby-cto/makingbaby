
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { UserBadges } from "@/components/dashboard/scheduling/components/header/UserBadges";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile, ProfileSubjectStatus, NotificationPreferences } from "@/types/profile";
import { Json } from "@/integrations/supabase/types";

const UserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          throw error;
        }

        // Transform the data to ensure subject_statuses is correctly typed
        if (data) {
          const transformedProfile: Profile = {
            ...data,
            subject_statuses: data.subject_statuses 
              ? (data.subject_statuses as Json[]).map(status => ({
                  name: (status as any).name || '',
                  status: (status as any).status || ''
                })) as ProfileSubjectStatus[]
              : null,
            // Transform notification_preferences from Json to NotificationPreferences
            notification_preferences: data.notification_preferences 
              ? {
                  email: typeof (data.notification_preferences as any).email === 'boolean' 
                    ? (data.notification_preferences as any).email 
                    : true,
                  sms: typeof (data.notification_preferences as any).sms === 'boolean' 
                    ? (data.notification_preferences as any).sms 
                    : false,
                  in_app: typeof (data.notification_preferences as any).in_app === 'boolean' 
                    ? (data.notification_preferences as any).in_app 
                    : true
                } as NotificationPreferences
              : null,
            // Transform upduo_status to proper union type
            upduo_status: data.upduo_status && typeof data.upduo_status === 'string' 
              ? (['pending', 'complete', 'failed'].includes(data.upduo_status) 
                ? data.upduo_status as "pending" | "complete" | "failed"
                : null)
              : null,
            // Handle metadata conversion to ensure proper typing
            metadata: data.metadata ? (data.metadata as Record<string, any>) : null
          };
          setProfile(transformedProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const getInitials = () => {
    if (!profile) return "";
    const first = profile.first_name?.charAt(0) || "";
    const last = profile.last_name?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  return (
    <DashboardLayout loading={loading}>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">User Profile</h1>
        
        {loading ? (
          <Card className="p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </Card>
        ) : profile ? (
          <Card className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold break-words leading-tight mb-2">
                  {profile.first_name} {profile.last_name}
                </h2>
                {profile.subject_statuses && (
                  <UserBadges 
                    approvedStance={profile.approved_stance} 
                    subjectStatuses={profile.subject_statuses}
                  />
                )}
              </div>
            </div>
            
            {profile.bio && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Bio</h3>
                <p className="text-gray-700 break-words leading-relaxed">{profile.bio}</p>
              </div>
            )}
            
            {profile.teaching_experience && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Teaching Experience</h3>
                <p className="text-gray-700 break-words leading-relaxed">{profile.teaching_experience}</p>
              </div>
            )}
            
            {profile.subjects && profile.subjects.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Subjects</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.subjects.map((subject, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm break-words"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-600">User profile not found</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
