
import { useState } from "react";
import { CrewMember } from "../types";
import { toggleCrewLeadStatus } from "../services/memberService";

export const useMemberLeadState = (
  crewId: string, 
  members: CrewMember[], 
  setMembers: React.Dispatch<React.SetStateAction<CrewMember[]>>
) => {
  const [isUpdatingLead, setIsUpdatingLead] = useState(false);

  const toggleCrewLead = async (memberId: string, isCurrentlyLead: boolean) => {
    if (isUpdatingLead) return;
    
    setIsUpdatingLead(true);
    
    const success = await toggleCrewLeadStatus(crewId, memberId, isCurrentlyLead);
    
    if (success) {
      // Update local state
      setMembers(members.map(member => 
        member.id === memberId 
          ? { ...member, is_lead: !isCurrentlyLead }
          : isCurrentlyLead 
            ? member 
            : { ...member, is_lead: false }
      ));
    }
    
    setIsUpdatingLead(false);
  };

  return {
    isUpdatingLead,
    setIsUpdatingLead,
    toggleCrewLead
  };
};
