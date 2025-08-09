
import { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, BookOpen, Pencil, Check, School, MapPin } from "lucide-react";
import type { Profile } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedInput } from "@/hooks/useDebouncedInput";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useLogger } from "@/hooks/useLogger";

interface ProfileCardProps {
  profile: Profile | null;
  onUpdate?: () => void;
}

// Define the database update type to match Supabase expectations
interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  teaching_experience?: string;
  location?: string;
  // Add other fields as needed, but keep subject_statuses as Json[]
  [key: string]: any;
}

export const ProfileCard = ({ profile, onUpdate }: ProfileCardProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const logger = useLogger('ProfileCard');
  
  // Performance monitoring - fix: only pass componentName
  const performanceMonitor = usePerformanceMonitor('ProfileCard');

  // Start performance measurement on render
  useEffect(() => {
    performanceMonitor.startMeasure();
    return () => {
      performanceMonitor.endMeasure();
    };
  });

  // Memoize profile values to prevent unnecessary re-renders
  const profileValues = useMemo(() => ({
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    bio: profile?.bio || "",
    teachingExperience: profile?.teaching_experience || "",
    location: profile?.location || ""
  }), [profile]);

  // Debounced inputs for auto-save functionality
  const firstName = useDebouncedInput(profileValues.firstName);
  const lastName = useDebouncedInput(profileValues.lastName);
  const location = useDebouncedInput(profileValues.location);
  const bio = useDebouncedInput(profileValues.bio, {
    delay: 1000, // Longer delay for bio since it's typically longer text
    onSave: useCallback(async (value: string) => {
      if (!profile?.id) return;
      await updateProfile({ bio: value });
    }, [profile?.id])
  });
  const teachingExperience = useDebouncedInput(profileValues.teachingExperience, {
    delay: 1000,
    onSave: useCallback(async (value: string) => {
      if (!profile?.id) return;
      await updateProfile({ teaching_experience: value });
    }, [profile?.id])
  });

  const updateProfile = useCallback(async (updates: ProfileUpdateData) => {
    if (!profile?.id) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your changes have been saved automatically.",
      });
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      logger.error('Failed to update profile:', { error, updates, profileId: profile.id });
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [profile?.id, toast, onUpdate, logger]);

  const handleSaveBasicInfo = useCallback(async () => {
    await updateProfile({
      first_name: firstName.value,
      last_name: lastName.value,
      location: location.value
    });
    setIsEditing(false);
  }, [firstName.value, lastName.value, location.value, updateProfile]);

  if (!profile) return null;

  return (
    <Card className="animate-fade-up">
      <CardHeader className="flex flex-row items-start space-x-4 pb-4">
        <Avatar className="h-16 w-16 flex-shrink-0">
          <AvatarImage src={profile.avatar_url || ""} alt={`${profile.first_name} ${profile.last_name}`} />
          <AvatarFallback className="bg-primary/10">
            <School className="h-8 w-8 text-primary" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 space-y-3">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={firstName.value}
                onChange={(e) => firstName.setValue(e.target.value)}
                placeholder="First Name"
              />
              <Input
                value={lastName.value}
                onChange={(e) => lastName.setValue(e.target.value)}
                placeholder="Last Name"
              />
              <Input
                value={location.value}
                onChange={(e) => location.setValue(e.target.value)}
                placeholder="Location"
              />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold leading-tight break-words">
                  {profile.first_name} {profile.last_name}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 h-8 w-8 p-0"
                  onClick={() => {
                    if (isEditing) {
                      handleSaveBasicInfo();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  disabled={isSaving}
                >
                  {isEditing ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full font-medium">
                    Teacher
                  </div>
                  {(bio.isSaving || teachingExperience.isSaving) && (
                    <div className="text-xs text-muted-foreground">Saving...</div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground break-words overflow-wrap-anywhere">
                  {profile.email}
                </div>
                {profile.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="break-words">{profile.location}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium flex items-center mb-2">
              <BookOpen className="h-4 w-4 mr-2 text-primary" /> 
              Bio
            </h3>
            <Textarea
              value={bio.value}
              onChange={(e) => bio.setValue(e.target.value)}
              placeholder="Tell us about yourself"
              className="min-h-[80px] resize-none break-words"
            />
            {bio.isDirty && (
              <div className="text-xs text-muted-foreground mt-1">
                Changes will be saved automatically...
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium flex items-center mb-2">
              <GraduationCap className="h-4 w-4 mr-2 text-primary" /> 
              Teaching Experience
            </h3>
            <Textarea
              value={teachingExperience.value}
              onChange={(e) => teachingExperience.setValue(e.target.value)}
              placeholder="Years of experience, subject areas, etc."
              className="min-h-[80px] resize-none break-words"
            />
            {teachingExperience.isDirty && (
              <div className="text-xs text-muted-foreground mt-1">
                Changes will be saved automatically...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
