
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/profile";

export const useAvatarUpload = (profile: Profile, onProfileUpdate?: () => void) => {
  const { toast } = useToast();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(profile?.avatar_url || null);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error("Please select a valid image file.");
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5242880) {
        throw new Error("Image size must be less than 5MB.");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}.${fileExt}`;

      // Delete old avatar if it exists
      if (profile.avatar_url) {
        try {
          const oldFilePath = profile.avatar_url.split("/").pop();
          if (oldFilePath && oldFilePath !== fileName) {
            await supabase.storage.from("avatars").remove([oldFilePath]);
          }
        } catch (removeError) {
          console.warn("Could not remove old avatar:", removeError);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: true // This will overwrite if file exists
        });

      if (uploadError) {
        // Provide more specific error messages based on the error type
        if (uploadError.message.includes('not found')) {
          throw new Error("Avatar storage is not configured. Please contact support.");
        } else if (uploadError.message.includes('policy')) {
          throw new Error("You don't have permission to upload avatars. Please contact support.");
        } else {
          throw uploadError;
        }
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update local state immediately for real-time UI update
      setLocalAvatarUrl(publicUrl);

      // Update profile in database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });

      // Trigger parent refresh to get updated profile data
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return {
    localAvatarUrl,
    uploadingAvatar,
    handleAvatarUpload,
  };
};
