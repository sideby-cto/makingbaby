
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Loader2 } from "lucide-react";
import { useAvatarBucket } from "@/hooks/useAvatarBucket";

interface AvatarUploadSectionProps {
  localAvatarUrl: string | null;
  firstName: string;
  lastName: string;
  uploadingAvatar: boolean;
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AvatarUploadSection = ({
  localAvatarUrl,
  firstName,
  lastName,
  uploadingAvatar,
  onAvatarUpload,
}: AvatarUploadSectionProps) => {
  const { bucketReady } = useAvatarBucket();

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className="h-20 w-20 ring-2 ring-primary/10 transition-shadow hover:ring-primary/20">
          <AvatarImage
            src={localAvatarUrl || ""}
            alt={`${firstName} ${lastName}`}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/5 text-primary text-lg">
            {firstName?.[0]}
            {lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <label
          htmlFor="avatar-upload"
          className="absolute inset-0 flex items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 shadow-md"
        >
          {uploadingAvatar ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={onAvatarUpload}
            disabled={uploadingAvatar || !bucketReady}
            className="hidden"
          />
        </label>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Click on your avatar to upload a new profile picture
      </p>
    </div>
  );
};
