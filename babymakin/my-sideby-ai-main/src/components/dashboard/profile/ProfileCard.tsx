
import { Card, CardContent } from "@/components/ui/card";
import { ComprehensiveProfileEditor } from "@/components/configuration/ComprehensiveProfileEditor";
import type { Profile } from "@/types/profile";

interface ProfileCardProps {
  profile: Profile | null;
  onEdit?: () => void;
  onUpdate?: () => void;
}

export const ProfileCard = ({ profile, onEdit, onUpdate }: ProfileCardProps) => {
  if (!profile) return null;

  return (
    <Card className="animate-fade-up overflow-hidden border-brand-primary/20 hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-0">
        <ComprehensiveProfileEditor 
          profile={profile} 
          onProfileUpdate={onUpdate}
        />
      </CardContent>
    </Card>
  );
};
