
import { ProfileCard } from "@/components/dashboard/profile/ProfileCard";
import type { Profile } from "@/types/profile";

interface SidebarProps {
  profile: Profile | null;
  onProfileUpdate?: () => void;
}

export const Sidebar = ({ profile, onProfileUpdate }: SidebarProps) => {
  return (
    <div className="space-y-6">
      <ProfileCard 
        profile={profile} 
        onUpdate={onProfileUpdate}
      />
    </div>
  );
};
