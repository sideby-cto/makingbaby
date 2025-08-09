
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { UpduoSession } from "@/hooks/useUpduoSessions";

export const useSessionFilters = (allSessions: UpduoSession[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sessionType, setSessionType] = useState<string>("all");
  const [hasTranscript, setHasTranscript] = useState<boolean>(false);
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setDateRange(undefined);
    setSessionType("all");
    setHasTranscript(false);
  };

  // Filter sessions based on all criteria
  const filteredSessions = allSessions.filter(session => {
    // Skip filtering if we have no sessions
    if (!session) return false;
    
    // Text search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      
      // Search in user names
      const usersMatch = session.users.some(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTermLower)
      );
      
      // Search in lesson names
      const lessonsMatch = session.knowledgeNodes.some(node => 
        node.name.toLowerCase().includes(searchTermLower)
      );
      
      if (!usersMatch && !lessonsMatch) return false;
    }
    
    // Date range filter
    if (dateRange?.from) {
      const sessionDate = new Date(session.createdAt);
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      if (sessionDate < fromDate) return false;
      
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (sessionDate > toDate) return false;
      }
    }
    
    // Session type filter
    if (sessionType !== "all" && session.type !== sessionType) {
      return false;
    }
    
    // Has transcript filter
    if (hasTranscript && (!session.transcriptContents || session.transcriptContents.length === 0)) {
      return false;
    }
    
    return true;
  });

  return {
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    sessionType,
    setSessionType,
    hasTranscript,
    setHasTranscript,
    resetFilters,
    filteredSessions
  };
};
