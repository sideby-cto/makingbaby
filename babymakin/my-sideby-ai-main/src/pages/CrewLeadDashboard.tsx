
import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { MatchList } from "@/components/admin/matchmaker/components/match-list/MatchList";
import { MatchDetailsDialog } from "@/components/admin/matchmaker/components/match-list/MatchDetailsDialog";
import { useMatchList } from "@/components/admin/matchmaker/hooks/useMatchList";
import { Match } from "@/components/admin/matchmaker/types/matches";
import { useUpduoSessions } from "@/hooks/useUpduoSessions";
import { useSessionFilters } from "@/components/admin/dashboard/components/sessions/hooks/useSessionFilters";
import { useSessionState } from "@/components/admin/dashboard/components/sessions/hooks/useSessionState";
import { SessionDetailView } from "@/components/admin/dashboard/components/sessions/SessionDetailView";
import { SessionListView } from "@/components/admin/dashboard/components/sessions/SessionListView";
import { useCrewLeadStatus } from "@/hooks/useCrewLeadStatus";
import { useCrewLeadData } from "@/hooks/useCrewLeadData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bug } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CrewLeadDashboard = () => {
  const navigate = useNavigate();
  const { isCrewLead, loading: statusLoading } = useCrewLeadStatus();
  const { data: crewData, loading: crewLoading } = useCrewLeadData();
  const { matches, loading: matchesLoading } = useMatchList();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    sessions,
    isLoading: sessionsLoading,
    isFetchingNextPage,
    error: sessionsError,
    hasNextPage,
    loadMore
  } = useUpduoSessions(50, true);

  const {
    selectedSession,
    setSelectedSession,
    isDetailView,
    goBackToList
  } = useSessionState(true);

  const crewMemberIds = crewData?.memberIds || [];
  // Fix the property access to use the correct properties based on the Match type
  const crewMatches = matches.filter(
    (m) => crewMemberIds.includes(m.user1.id) && crewMemberIds.includes(m.user2.id)
  );

  const crewSessions = sessions.filter((s) =>
    s.users.some((u) => crewMemberIds.includes(u.id))
  );

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
  } = useSessionFilters(crewSessions);

  if (statusLoading || crewLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isCrewLead || !crewData) {
    return (
      <DashboardLayout>
        <p>You do not have access to this page.</p>
      </DashboardLayout>
    );
  }

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedMatch(null), 300);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {crewData.crewName} Crew Overview
          </h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/chaos-testing')}
            className="gap-2"
          >
            <Bug className="h-4 w-4" />
            Chaos Testing
          </Button>
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Crew Matches</h2>
          {matchesLoading ? (
            <p>Loading matches...</p>
          ) : crewMatches.length === 0 ? (
            <p>No matches found for this crew.</p>
          ) : (
            <div className="space-y-4">
              <MatchList
                matches={crewMatches}
                localRefreshKey={0}
                onSelectMatch={handleSelectMatch}
              />
            </div>
          )}
        </section>

        <MatchDetailsDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedMatch={selectedMatch}
          onClose={handleCloseDialog}
          onUpdate={handleCloseDialog}
        />

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Crew Sessions</h2>
          {isDetailView && selectedSession && (
            <div className="mb-4">
              <Button variant="outline" onClick={goBackToList} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to List
              </Button>
            </div>
          )}
          {!isDetailView ? (
            <SessionListView
              sessions={filteredSessions}
              isLoading={sessionsLoading}
              isFetchingNextPage={isFetchingNextPage}
              error={sessionsError}
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
          ) : (
            selectedSession && <SessionDetailView session={selectedSession} />
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default CrewLeadDashboard;
