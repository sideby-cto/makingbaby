
import { useState } from "react";
import { Profile } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAvatarUpload } from "./hooks/useAvatarUpload";
import { ProfileViewMode } from "./components/ProfileViewMode";
import { ProfileEditMode } from "./components/ProfileEditMode";

interface ComprehensiveProfileEditorProps {
  profile: Profile;
  onProfileUpdate?: () => void;
}

export const ComprehensiveProfileEditor = ({ profile, onProfileUpdate }: ComprehensiveProfileEditorProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    location: profile.location || "",
    bio: profile.bio || "",
    teaching_experience: profile.teaching_experience || "",
    hats: profile.subjects || []
  });

  const { localAvatarUrl, uploadingAvatar, handleAvatarUpload } = useAvatarUpload(profile, onProfileUpdate);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (name: string, values: string[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: values
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          location: formData.location,
          bio: formData.bio,
          teaching_experience: formData.teaching_experience,
          subjects: formData.hats
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      // Switch to view mode after saving
      setIsEditing(false);

      // Trigger parent refresh to get updated profile data
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      location: profile.location || "",
      bio: profile.bio || "",
      teaching_experience: profile.teaching_experience || "",
      hats: profile.subjects || []
    });
  };

  if (!isEditing) {
    return (
      <ProfileViewMode
        localAvatarUrl={localAvatarUrl}
        formData={formData}
        profileEmail={profile.email}
        onEdit={() => setIsEditing(true)}
      />
    );
  }

  return (
    <ProfileEditMode
      formData={formData}
      localAvatarUrl={localAvatarUrl}
      uploadingAvatar={uploadingAvatar}
      isLoading={isLoading}
      profile={profile}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onInputChange={handleInputChange}
      onMultiSelectChange={handleMultiSelectChange}
      onAvatarUpload={handleAvatarUpload}
    />
  );
};
