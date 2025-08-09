
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, MapPin } from "lucide-react";

interface ProfileViewModeProps {
  localAvatarUrl: string | null;
  formData: {
    first_name: string;
    last_name: string;
    location: string;
    bio: string;
    teaching_experience: string;
    hats: string[];
  };
  profileEmail: string | null;
  onEdit: () => void;
}

export const ProfileViewMode = ({
  localAvatarUrl,
  formData,
  profileEmail,
  onEdit,
}: ProfileViewModeProps) => {
  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        {/* Avatar Display */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 ring-2 ring-brand-primary/10">
            <AvatarImage
              src={localAvatarUrl || ""}
              alt={`${formData.first_name} ${formData.last_name}`}
              className="object-cover"
            />
            <AvatarFallback className="bg-brand-primary/5 text-brand-primary text-lg">
              {formData.first_name?.[0]}
              {formData.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold font-display">
              {formData.first_name} {formData.last_name}
            </h3>
            <p className="text-sm text-muted-foreground truncate" title={profileEmail || ""}>{profileEmail}</p>
            {formData.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                {formData.location}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {formData.bio && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Bio</Label>
            <p className="text-sm text-muted-foreground">{formData.bio}</p>
          </div>
        )}

        {/* Teaching Experience */}
        {formData.teaching_experience && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Teaching Experience</Label>
            <p className="text-sm text-muted-foreground">{formData.teaching_experience}</p>
          </div>
        )}

        {/* Hats */}
        {formData.hats && formData.hats.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Hats</Label>
            <div className="flex flex-wrap gap-2">
              {formData.hats.map((hat, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary"
                >
                  {hat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Edit Profile Button */}
        <div className="flex justify-center pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
