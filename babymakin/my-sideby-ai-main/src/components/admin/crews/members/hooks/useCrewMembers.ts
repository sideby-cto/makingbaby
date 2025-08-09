
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CrewMember } from "../types";
import { 
  fetchCrewMembers, 
  addCrewMember, 
  removeCrewMember,
  toggleCrewLeadStatus 
} from "../services/memberService";
import { useMemberLeadState } from "./useMemberLeadState";
import { useMemberDialogState } from "./useMemberDialogState";

export const useCrewMembers = (crewId: string) => {
  const [members, setMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { 
    isUpdatingLead,
    setIsUpdatingLead,
    toggleCrewLead
  } = useMemberLeadState(crewId, members, setMembers);

  const {
    isAddDialogOpen,
    setIsAddDialogOpen,
    newMemberEmail,
    setNewMemberEmail,
    processingEmail,
    setProcessingEmail,
    handleAddMember: processAddMember
  } = useMemberDialogState();

  // Load crew members
  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      const loadedMembers = await fetchCrewMembers(crewId);
      setMembers(loadedMembers);
      setLoading(false);
    };

    if (crewId) {
      loadMembers();
    }
  }, [crewId]);

  const handleAddMember = async () => {
    if (!newMemberEmail || processingEmail) return;
    
    setProcessingEmail(true);
    
    const newMember = await processAddMember(crewId, newMemberEmail);
    
    if (newMember) {
      setMembers([newMember, ...members]);
      setNewMemberEmail("");
      setIsAddDialogOpen(false);
    }
    
    setProcessingEmail(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    const success = await removeCrewMember(memberId);
    if (success) {
      setMembers(members.filter(member => member.id !== memberId));
    }
  };

  return {
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
  };
};
