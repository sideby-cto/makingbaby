
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Profile } from "@/types/profile";
import { useExperiments } from "./hooks/useExperiments";
import { useUserRemoval } from "./hooks/useUserRemoval";
import { ProfileExperimentCard } from "./ProfileExperimentCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ExperimentsGridProps {
  profiles: Profile[];
  experimentType: string;
  sortType?: string;
}

export const ExperimentsGrid = ({ profiles: initialProfiles, experimentType, sortType }: ExperimentsGridProps) => {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles.filter(profile => profile.status !== 'deleted'));
  
  const { 
    getLatestExperiment, 
    getSecondOpinion,
    refetchExperiments 
  } = useExperiments(experimentType);

  const { 
    removingUserId,
    handleRemoveUser 
  } = useUserRemoval();

  // Update profiles when initialProfiles changes
  useEffect(() => {
    setProfiles(initialProfiles.filter(profile => profile.status !== 'deleted'));
  }, [initialProfiles]);

  // Set up realtime subscription for profile status changes
  useEffect(() => {
    const channel = supabase
      .channel('profiles-status-changes')
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
          
          // Remove this profile from the local state
          setProfiles(prevProfiles => 
            prevProfiles.filter(profile => profile.id !== deletedUserId)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 p-4">
        {profiles.length === 0 ? (
          <div className="col-span-full flex items-center justify-center p-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <div className="text-center">
              <p className="text-muted-foreground mb-1">No profiles to display</p>
              <p className="text-xs text-slate-400">Try changing your search criteria</p>
            </div>
          </div>
        ) : (
          profiles
            .filter(profile => profile.id !== removingUserId) // Filter out profiles currently being removed
            .map((profile) => {
              const experiment = getLatestExperiment(profile.id);
              const secondOpinion = getSecondOpinion(profile.id);
              
              return (
                <ProfileExperimentCard
                  key={profile.id}
                  profile={profile}
                  experiment={experiment}
                  secondOpinion={secondOpinion}
                  processingUserId={null}
                  removingUserId={removingUserId}
                  onRemoveUser={handleRemoveUser}
                />
              );
            })
        )}
      </div>
    </ScrollArea>
  );
}
