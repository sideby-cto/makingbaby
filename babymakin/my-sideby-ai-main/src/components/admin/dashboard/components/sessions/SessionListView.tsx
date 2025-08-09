
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { UpduoSession } from "@/hooks/useUpduoSessions";
import { useSessionAnalysis } from "./hooks/useSessionAnalysis";
import { SessionAnalysisBar } from "./components/SessionAnalysisBar";
import { SessionsTable } from "./components/SessionsTable";
import { SessionLoadMore } from "./components/SessionLoadMore";
import { EmptyStateRenderer } from "./components/EmptyStateRenderer";
import { Card, CardContent } from "@/components/ui/card";
import { SessionSearch } from "./SessionSearch";
import { SessionFilters } from "./SessionFilters";
import { DateRange } from "react-day-picker";

interface SessionListViewProps {
  sessions: UpduoSession[];
  isLoading: boolean;
  isFetchingNextPage?: boolean;
  error: Error | null;
  hasNextPage: boolean;
  loadMore: () => Promise<void>;
  onSelectSession: (session: UpduoSession) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  sessionType: string;
  setSessionType: (type: string) => void;
  hasTranscript: boolean;
  setHasTranscript: (value: boolean) => void;
  resetFilters: () => void;
}

export const SessionListView = ({
  sessions,
  isLoading,
  isFetchingNextPage = false,
  error,
  hasNextPage,
  loadMore,
  onSelectSession,
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  sessionType,
  setSessionType,
  hasTranscript,
  setHasTranscript,
  resetFilters
}: SessionListViewProps) => {
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
    rootMargin: '400px' // Increase root margin to load earlier
  });
  
  const { 
    selectedSessionIds, 
    analyzing, 
    toggleSessionSelection, 
    analyzeSelectedSessions 
  } = useSessionAnalysis();

  // Debounce the load more function to prevent multiple rapid calls
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (inView && hasNextPage && !isLoading && !isFetchingNextPage) {
      timeoutId = setTimeout(() => {
        loadMore();
      }, 300); // Small delay to prevent multiple calls
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [inView, hasNextPage, isLoading, isFetchingNextPage, loadMore]);

  const handleAnalyzeSession = () => {
    analyzeSelectedSessions(sessions);
  };

  const handleSessionSelection = (sessionId: string, selected: boolean) => {
    toggleSessionSelection(sessionId);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end flex-wrap gap-2">
        <SessionSearch 
          value={searchTerm}
          onChange={setSearchTerm}
          className="w-full md:w-60"
        />
      </div>
      
      <SessionFilters 
        dateRange={dateRange}
        setDateRange={setDateRange}
        sessionType={sessionType}
        setSessionType={setSessionType}
        hasTranscript={hasTranscript}
        setHasTranscript={setHasTranscript}
        onReset={resetFilters}
      />
      
      <Card className="border shadow-sm h-full flex flex-col">
        <CardContent className="p-3 flex-1 flex flex-col overflow-hidden">
          <SessionAnalysisBar 
            selectedCount={selectedSessionIds.length}
            analyzing={analyzing}
            onAnalyze={handleAnalyzeSession}
          />
          
          <div className="flex-1 overflow-auto mt-3">
            {(isLoading || error || sessions.length === 0) ? (
              <EmptyStateRenderer 
                isLoading={isLoading} 
                error={error} 
                searchTerm={searchTerm} 
                sessions={sessions} 
              />
            ) : (
              <>
                <SessionsTable 
                  sessions={sessions}
                  selectedSessionIds={selectedSessionIds}
                  onSelect={handleSessionSelection}
                  onViewDetails={onSelectSession}
                />
                
                {/* Always render load more component when there's a next page */}
                {hasNextPage && (
                  <SessionLoadMore 
                    isLoading={isFetchingNextPage}
                    loadMoreRef={loadMoreRef}
                  />
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
