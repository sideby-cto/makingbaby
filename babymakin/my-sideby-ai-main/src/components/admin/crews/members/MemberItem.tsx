
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { CrewLeadIndicator } from "../CrewLeadIndicator";
import { CrewMember } from "./types";

interface MemberItemProps {
  member: CrewMember;
  onRemove: (memberId: string) => Promise<void>;
  onToggleCrewLead: (memberId: string, isCurrentlyLead: boolean) => Promise<void>;
  isUpdatingLead: boolean;
}

export const MemberItem: React.FC<MemberItemProps> = ({ 
  member, 
  onRemove, 
  onToggleCrewLead,
  isUpdatingLead
}) => {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };
  
  return (
    <TableRow>
      <TableCell className="flex items-center space-x-2">
        <Avatar>
          <AvatarFallback>
            {getInitials(
              member.profile?.first_name,
              member.profile?.last_name
            )}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center">
            <p className="font-medium">
              {member.profile?.first_name} {member.profile?.last_name}
            </p>
            {member.is_lead && <CrewLeadIndicator className="ml-2" />}
          </div>
          <p className="text-xs text-muted-foreground md:hidden">
            {member.profile?.email}
          </p>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {member.profile?.email}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {new Date(member.joined_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right whitespace-nowrap">
        <Button
          variant="ghost"
          size="sm"
          className={`text-xs ${member.is_lead ? 'text-orange-500' : ''}`}
          onClick={() => onToggleCrewLead(member.id, member.is_lead)}
          disabled={isUpdatingLead}
        >
          {member.is_lead ? "Remove Lead" : "Make Lead"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-red-500 ml-1"
          onClick={() => onRemove(member.id)}
        >
          Remove
        </Button>
      </TableCell>
    </TableRow>
  );
};
