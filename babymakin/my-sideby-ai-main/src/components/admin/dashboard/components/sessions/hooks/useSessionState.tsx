
import { useState, useEffect } from "react";
import { UpduoSession } from "@/hooks/useUpduoSessions";

export const useSessionState = (open: boolean) => {
  const [selectedSession, setSelectedSession] = useState<UpduoSession | null>(null);
  const [isDetailView, setIsDetailView] = useState<boolean>(false);
  
  // Reset to list view when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedSession(null);
      setIsDetailView(false);
    }
  }, [open]);
  
  // When selecting a session, switch to detail view
  useEffect(() => {
    if (selectedSession) {
      setIsDetailView(true);
    }
  }, [selectedSession]);

  const goBackToList = () => {
    setSelectedSession(null);
    setIsDetailView(false);
  };

  return {
    selectedSession,
    setSelectedSession,
    isDetailView,
    setIsDetailView,
    goBackToList
  };
};
