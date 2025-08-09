
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, User } from "lucide-react";
import { AvatarUploadSection } from "./AvatarUploadSection";
import { ProfileFormFields } from "./ProfileFormFields";
import { Profile } from "@/types/profile";

interface ProfileEditModeProps {
  formData: {
    first_name: string;
    last_name: string;
    location: string;
    bio: string;
    teaching_experience: string;
    hats: string[];
  };
  localAvatarUrl: string | null;
  uploadingAvatar: boolean;
  isLoading: boolean;
  profile: Profile;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onMultiSelectChange: (name: string, values: string[]) => void;
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileEditMode = ({
  formData,
  localAvatarUrl,
  uploadingAvatar,
  isLoading,
  onSubmit,
  onCancel,
  onInputChange,
  onMultiSelectChange,
  onAvatarUpload,
}: ProfileEditModeProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <User className="h-5 w-5" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Avatar Upload Section */}
          <AvatarUploadSection
            localAvatarUrl={localAvatarUrl}
            firstName={formData.first_name}
            lastName={formData.last_name}
            uploadingAvatar={uploadingAvatar}
            onAvatarUpload={onAvatarUpload}
          />

          {/* Form Fields */}
          <ProfileFormFields
            formData={formData}
            onInputChange={onInputChange}
            onMultiSelectChange={onMultiSelectChange}
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || uploadingAvatar}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || uploadingAvatar}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
