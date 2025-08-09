
import React from "react";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from "@/components/ui/table";
import { MemberItem } from "./MemberItem";
import { CrewMember } from "./types";

interface MembersListProps {
  members: CrewMember[];
  loading: boolean;
  isUpdatingLead: boolean;
  onRemoveMember: (memberId: string) => Promise<void>;
  onToggleCrewLead: (memberId: string, isCurrentlyLead: boolean) => Promise<void>;
}

export const MembersList: React.FC<MembersListProps> = ({
  members,
  loading,
  isUpdatingLead,
  onRemoveMember,
  onToggleCrewLead
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                Loading members...
              </TableCell>
            </TableRow>
          ) : members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                No members in this crew yet
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <MemberItem 
                key={member.id}
                member={member}
                onRemove={onRemoveMember}
                onToggleCrewLead={onToggleCrewLead}
                isUpdatingLead={isUpdatingLead}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
