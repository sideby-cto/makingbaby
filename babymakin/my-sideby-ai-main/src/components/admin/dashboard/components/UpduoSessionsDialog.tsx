
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUpduoSessions } from "@/hooks/useUpduoSessions";
import { SessionDialogHeader } from "./sessions/dialogs/SessionDialogHeader";
import { SessionListView } from "./sessions/SessionListView";
import { SessionDetailView } from "./sessions/SessionDetailView";
import { useSessionFilters } from "./sessions/hooks/useSessionFilters";
import { useSessionState } from "./sessions/hooks/useSessionState";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UpduoSessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpduoSessionsDialog = ({ open, onOpenChange }: UpduoSessionsDialogProps) => {
  // Load sessions
  const { 
    sessions, 
    isLoading, 
    isFetchingNextPage,
    error, 
    hasNextPage, 
    loadMore 
  } = useUpduoSessions(50, true);
  
  // Session state management
  const {
    selectedSession,
    setSelectedSession,
    isDetailView,
    setIsDetailView,
    goBackToList
  } = useSessionState(open);
  
  // Filter management
  const {
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
  } = useSessionFilters(sessions);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl flex flex-col h-[85vh] p-0 gap-0 overflow-hidden">
        <SessionDialogHeader />
        
        <div className="flex items-center px-4 pt-1 pb-2 border-b sticky top-14 z-10 bg-background">
          <div className="flex-1">
            {isDetailView && selectedSession && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={goBackToList}
                className="gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to List
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {!isDetailView ? (
              <div className="p-4">
                <SessionListView
                  sessions={filteredSessions}
                  isLoading={isLoading}
                  isFetchingNextPage={isFetchingNextPage}
                  error={error}
                  hasNextPage={hasNextPage}
                  loadMore={loadMore}
                  onSelectSession={setSelectedSession}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  sessionType={sessionType}
                  setSessionType={setSessionType}
                  hasTranscript={hasTranscript}
                  setHasTranscript={setHasTranscript}
                  resetFilters={resetFilters}
                />
              </div>
            ) : (
              <div className="px-4 py-3">
                {selectedSession && <SessionDetailView session={selectedSession} />}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
