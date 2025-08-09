
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { MembersList } from "./MembersList";
import { AddMemberDialog } from "./AddMemberDialog";
import { useCrewMembers } from "./hooks";

interface CrewMembersListProps {
  crewId: string;
}

export const CrewMembersList: React.FC<CrewMembersListProps> = ({ crewId }) => {
  const {
    members,
    loading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    newMemberEmail,
    setNewMemberEmail,
    processingEmail,
    isUpdatingLead,
    handleAddMember,
    handleRemoveMember,
    toggleCrewLead
  } = useCrewMembers(crewId);

  if (!crewId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid crew ID. Please go back and select a valid crew.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Crew Members ({members.length})</h3>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-[#FF5733] hover:bg-[#FF5733]/90"
        >
          Add Member
        </Button>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Adding or removing members will automatically update their Upduo tags based on crew assignments.
        </AlertDescription>
      </Alert>
      
      <MembersList
        members={members}
        loading={loading}
        isUpdatingLead={isUpdatingLead}
        onRemoveMember={handleRemoveMember}
        onToggleCrewLead={toggleCrewLead}
      />
      
      <AddMemberDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        newMemberEmail={newMemberEmail}
        onEmailChange={setNewMemberEmail}
        onAddMember={handleAddMember}
        isProcessing={processingEmail}
      />
    </div>
  );
};
