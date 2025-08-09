import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsersThree, Play, Pause, Eye } from "@phosphor-icons/react";
import { useAdminMatchStats } from "../hooks/useAdminMatchStats";
import { useRecentMatches } from "../hooks/useRecentMatches";
import { useStartMatching } from "../hooks/useStartMatching";
import { BreakMatchDialog } from "../components/BreakMatchDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavigate } from "react-router-dom";

export const AdminMatchesTab = () => {
  const { stats, loading: statsLoading } = useAdminMatchStats();
  const { matches, loading: matchesLoading, refetch: refetchMatches } = useRecentMatches();
  const { startMatching, isRunning } = useStartMatching();
  const [breakMatchDialog, setBreakMatchDialog] = useState<{
    isOpen: boolean;
    matchId: string;
    user1Name: string;
    user2Name: string;
  } | null>(null);
  const navigate = useNavigate();

  const handleStartMatching = () => {
    startMatching();
  };

  const handleViewDetails = (matchId: string) => {
    navigate(`/admin?tab=matches&view=details&id=${matchId}`);
  };

  const handleBreakMatch = (matchId: string, user1Name: string, user2Name: string) => {
    setBreakMatchDialog({
      isOpen: true,
      matchId,
      user1Name,
      user2Name
    });
  };

  const handleMatchBroken = () => {
    refetchMatches();
    setBreakMatchDialog(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-sm text-semantic-text-primary font-sans">
            Match Management
          </h2>
          <p className="text-body-md text-semantic-text-secondary mt-2">
            Monitor and manage automatic matching between learners
          </p>
        </div>
        <Button 
          className="flex items-center gap-2" 
          onClick={handleStartMatching}
          disabled={isRunning}
        >
          <Play size={18} weight="regular" />
          {isRunning ? "Finding Matches..." : "Start Matching"}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Active Matches</CardTitle>
            <UsersThree className="h-4 w-4 text-semantic-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-display-sm font-bold text-semantic-text-primary">
              {statsLoading ? <LoadingSpinner size="sm" /> : stats.activeMatches}
            </div>
            <p className="text-body-xs text-semantic-text-secondary">
              Currently learning together
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Pending Matches</CardTitle>
            <UsersThree className="h-4 w-4 text-semantic-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-display-sm font-bold text-semantic-text-primary">
              {statsLoading ? <LoadingSpinner size="sm" /> : stats.pendingMatches}
            </div>
            <p className="text-body-xs text-semantic-text-secondary">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Match Success Rate</CardTitle>
            <UsersThree className="h-4 w-4 text-semantic-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-display-sm font-bold text-semantic-text-primary">
              {statsLoading ? <LoadingSpinner size="sm" /> : `${stats.successRate}%`}
            </div>
            <p className="text-body-xs text-semantic-text-secondary">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Queue Length</CardTitle>
            <UsersThree className="h-4 w-4 text-semantic-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-display-sm font-bold text-semantic-text-primary">
              {statsLoading ? <LoadingSpinner size="sm" /> : stats.queueLength}
            </div>
            <p className="text-body-xs text-semantic-text-secondary">
              Waiting for matches
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Matching Control */}
      <Card>
        <CardHeader>
          <CardTitle>Automatic Matching Control</CardTitle>
          <CardDescription>
            Monitor and control the automatic matching system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-semantic-border rounded-lg bg-semantic-surface">
            <div>
              <h4 className="text-body-md font-medium text-semantic-text-primary">
                Matching System Status
              </h4>
              <p className="text-body-sm text-semantic-text-secondary">
                Currently running • Last match: 2 minutes ago
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Pause size={16} weight="regular" />
                Pause
              </Button>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Matches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Matches</CardTitle>
          <CardDescription>
            Latest matches created by the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matchesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner text="Loading recent matches..." />
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8 text-semantic-text-secondary">
              No recent matches found.
            </div>
          ) : (
            <div className="space-y-4">
              {matches.slice(0, 5).map((match) => {
                const user1Name = `${match.user1.first_name || ''} ${match.user1.last_name || ''}`.trim() || 'Unknown User';
                const user2Name = `${match.user2.first_name || ''} ${match.user2.last_name || ''}`.trim() || 'Unknown User';
                const timeAgo = new Date(match.created_at).toLocaleString();
                
                return (
                  <div key={match.id} className="flex items-center justify-between p-4 border border-semantic-border rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-body-md font-medium text-semantic-text-primary">
                        {user1Name} & {user2Name}
                      </h4>
                      <p className="text-body-sm text-semantic-text-secondary">
                        {match.rationale || 'No rationale provided'} • Matched {timeAgo}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(match.id)}
                      >
                        <Eye size={16} weight="regular" className="mr-1" />
                        View Details
                      </Button>
                      {match.status === 'active' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleBreakMatch(match.id, user1Name, user2Name)}
                        >
                          Break Match
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Break Match Dialog */}
      {breakMatchDialog && (
        <BreakMatchDialog
          isOpen={breakMatchDialog.isOpen}
          onClose={() => setBreakMatchDialog(null)}
          matchId={breakMatchDialog.matchId}
          user1Name={breakMatchDialog.user1Name}
          user2Name={breakMatchDialog.user2Name}
          onMatchBroken={handleMatchBroken}
        />
      )}
    </div>
  );
};