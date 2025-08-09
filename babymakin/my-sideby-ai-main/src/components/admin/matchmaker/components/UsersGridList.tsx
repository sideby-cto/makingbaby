
import React from "react";
import { UserCard } from "./UserCard";
import { Profile } from "../types/matchmaking";

interface UsersGridListProps {
  profiles: Profile[];
  onUserSelect: (user: Profile) => void;
  compact?: boolean;
}

export const UsersGridList: React.FC<UsersGridListProps> = ({ 
  profiles, 
  onUserSelect,
  compact = false
}) => {
  return (
    <div className={`grid gap-3 ${compact 
      ? 'grid-cols-1' 
      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}
    >
      {profiles.map((profile) => (
        <UserCard 
          key={profile.id} 
          profile={profile} 
          onClick={() => onUserSelect(profile)} 
          compact={compact}
        />
      ))}
    </div>
  );
};
