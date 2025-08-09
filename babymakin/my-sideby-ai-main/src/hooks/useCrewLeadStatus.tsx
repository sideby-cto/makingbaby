import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isCrewLead } from "@/utils/admin/crewUtils";

export const useCrewLeadStatus = () => {
  const { user } = useAuth();
  const [isCrewLeadState, setIsCrewLeadState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.id) {
        setIsCrewLeadState(false);
        setLoading(false);
        return;
      }
      const result = await isCrewLead(user.id);
      setIsCrewLeadState(result);
      setLoading(false);
    };

    checkStatus();
  }, [user]);

  return { isCrewLead: isCrewLeadState, loading };
};
