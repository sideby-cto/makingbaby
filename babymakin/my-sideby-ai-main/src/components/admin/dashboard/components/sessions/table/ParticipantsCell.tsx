
import React from "react";
import { UpduoUser } from "@/types/upduo";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, User } from "lucide-react";
import { useUpduoAssociations } from "@/hooks/useUpduoAssociations";
import { AssociationActions } from "./AssociationActions";

interface ParticipantsCellProps {
  users: UpduoUser[];
}

interface ParticipantItemProps {
  user: UpduoUser;
  isLast: boolean;
}

const ParticipantItem = ({ user, isLast }: ParticipantItemProps) => {
  const { getAssociation } = useUpduoAssociations();
  
  const { data: association, isLoading } = getAssociation(
    user.firstName, 
    user.lastName, 
    user.id
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 py-0.5">
        <span className="text-sm">
          {user.firstName} {user.lastName}
        </span>
        <div className="h-2 w-2 bg-muted animate-pulse rounded-full" />
        {!isLast && <span className="text-muted-foreground">, </span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 py-0.5">
      <span className="text-sm">
        {user.firstName} {user.lastName}
      </span>
      
      {association ? (
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-success" />
          <Badge variant="outline" className="text-xs px-1 py-0 h-4">
            {association.profiles?.first_name} {association.profiles?.last_name}
          </Badge>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3 text-warning" />
          <AssociationActions 
            upduoUser={user} 
            onAssociationCreated={() => {
              // Force refetch of association data
              // The query will automatically update due to invalidation in the hook
            }} 
          />
        </div>
      )}
      
      {!isLast && <span className="text-muted-foreground">, </span>}
    </div>
  );
};

export const ParticipantsCell = ({ users }: ParticipantsCellProps) => {
  if (!users || users.length === 0) {
    return (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <User className="h-3 w-3" />
        Unknown users
      </div>
    );
  }

  // For many users, show compact view
  if (users.length > 3) {
    const associatedCount = users.filter(user => {
      // This is a simplified check - in real usage we'd need to fetch association status
      return false; // Placeholder
    }).length;

    return (
      <div className="space-y-1">
        <div className="text-sm">
          {users.slice(0, 2).map((user, index) => (
            <ParticipantItem 
              key={user.id || index} 
              user={user} 
              isLast={index === 1} 
            />
          ))}
          {users.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{users.length - 2} more participants
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {users.map((user, index) => (
        <ParticipantItem 
          key={user.id || index} 
          user={user} 
          isLast={index === users.length - 1} 
        />
      ))}
    </div>
  );
};
