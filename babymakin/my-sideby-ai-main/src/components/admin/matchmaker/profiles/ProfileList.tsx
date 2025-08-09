import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Profile } from "@/components/admin/matchmaker/types/matchmaking";

interface ProfileListProps {
  searchTerm: string;
  onSelectUser: (user: Profile) => void;
  selectedUsers: [Profile | null, Profile | null] | null;
}

export const ProfileList: React.FC<ProfileListProps> = ({ 
  searchTerm, 
  onSelectUser, 
  selectedUsers 
}) => {
  return (
    <Card data-testid="profile-list-card">
      <CardContent data-testid="profile-list-content">
        <p className="text-muted-foreground">
          Profile list feature is coming soon.
          {searchTerm && ` Searching for: "${searchTerm}"`}
        </p>
      </CardContent>
    </Card>
  );
};