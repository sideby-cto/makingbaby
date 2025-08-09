
import { useState } from "react";
import { addCrewMember } from "../services/memberService";

export const useMemberDialogState = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [processingEmail, setProcessingEmail] = useState(false);

  const handleAddMember = async (crewId: string, email: string) => {
    setProcessingEmail(true);
    try {
      const result = await addCrewMember(crewId, email);
      return result;
    } catch (error) {
      console.error("Error adding member:", error);
      return false;
    } finally {
      setProcessingEmail(false);
    }
  };

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    newMemberEmail,
    setNewMemberEmail,
    processingEmail,
    setProcessingEmail,
    handleAddMember
  };
};
