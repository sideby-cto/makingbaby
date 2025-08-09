
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Upload, Camera } from "lucide-react";
import type { Profile } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Get Supabase URL from environment or fallback to a default
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || "https://mzoolkwmpppncywkqezd.supabase.co";

interface ProfileHeaderProps {
  profile: Profile | null;
  onEdit?: () => void;
  onUpdate?: () => void;
}

export const ProfileHeader = ({
  profile,
  onEdit,
  onUpdate,
}: ProfileHeaderProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(
    profile?.avatar_url || null
  );
  const [bucketReady, setBucketReady] = useState(false);

  // Ensure the avatars bucket exists
  useEffect(() => {
    const ensureAvatarBucketExists = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        try {
          const res = await fetch(
            `${SUPABASE_URL}/functions/v1/create-avatars-bucket`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );

          if (res.ok) {
            const result = await res.json();
            if (result.success) {
              setBucketReady(true);
            } else {
              console.error("Failed to ensure avatar bucket exists:", result.error);
            }
          } else {
            console.warn(`Edge function returned status ${res.status}`);
            setBucketReady(true);
          }
        } catch (fetchError) {
          console.error("Error calling edge function:", fetchError);
          setBucketReady(true);
          
          toast({
            title: "Storage Setup Note",
            description: "Could not verify storage setup. You may still be able to upload avatars.",
            variant: "default",
          });
        }
      } catch (error: any) {
        console.error("Error ensuring avatar bucket exists:", error);
        setBucketReady(true);
      }
    };

    ensureAvatarBucketExists();
  }, [toast]);

  if (!profile) return null;

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;

      // Delete old avatar if it exists
      if (profile.avatar_url) {
        try {
          const oldFilePath = profile.avatar_url.split("/").pop();
          if (oldFilePath) {
            await supabase.storage.from("avatars").remove([oldFilePath]);
          }
        } catch (removeError) {
          console.warn("Could not remove old avatar:", removeError);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      setLocalAvatarUrl(publicUrl);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });

      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error uploading avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <div className="relative group">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-4 ring-sideby-orange-100 transition-all duration-300 hover:ring-sideby-orange-200 shadow-lg">
              <AvatarImage
                src={localAvatarUrl || ""}
                alt={`${profile.first_name} ${profile.last_name}`}
                className="object-cover w-full h-full"
              />
              <AvatarFallback className="bg-gradient-to-br from-sideby-orange-100 to-sideby-blue-100 text-sideby-text-primary text-lg font-bold border-2 border-sideby-orange-200">
                {profile.first_name?.[0]}
                {profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg border-2 border-sideby-orange-200">
              <Camera className="h-3 w-3 text-sideby-orange-600" />
            </div>
          </div>
          <label
            htmlFor="avatar-upload"
            className="absolute inset-0 flex items-center justify-center bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 shadow-xl backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-1">
              <Upload className="h-5 w-5" />
              <span className="text-xs font-semibold">Upload</span>
            </div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading || !bucketReady}
              className="hidden"
            />
          </label>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        <div className="flex-1 pt-1">
          <div className="space-y-2">
            <div>
              <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-sideby-text-primary via-sideby-burgundy-600 to-sideby-blue-600 bg-clip-text text-transparent leading-tight">
                {profile.first_name} {profile.last_name}
              </h2>
              <div className="h-1 w-12 bg-gradient-to-r from-sideby-orange-400 to-sideby-blue-400 rounded-full mt-1"></div>
            </div>

            {profile.bio && (
              <p className="text-sideby-text-secondary leading-relaxed font-medium max-w-xl text-base">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {profile.approved_stance && (
        <div className="bg-gradient-to-r from-sideby-blue-50 via-white to-sideby-orange-50 rounded-xl p-5 border-2 border-dashed border-sideby-blue-200 hover:border-sideby-blue-300 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sideby-blue-400 to-sideby-orange-400"></div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-sideby-blue-500 mt-2"></div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-sideby-text-primary tracking-wide">
                Teaching Stance
              </h3>
              <p className="text-sideby-text-secondary font-medium leading-relaxed italic text-sm">
                "{profile.approved_stance}"
              </p>
            </div>
          </div>
        </div>
      )}

      {onEdit && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-6 py-2 bg-sideby-orange-50 hover:bg-sideby-orange-100 text-sideby-orange-600 hover:text-sideby-orange-700 border-2 border-sideby-orange-200 hover:border-sideby-orange-300 transition-all duration-200 hover:scale-105 shadow-sm"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      )}
    </div>
  );
};
