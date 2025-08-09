
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useMatchList } from "../hooks/useMatchList";
import { Match } from "../types/matches";
import { MatchItem } from "./MatchItem";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Search, RefreshCw, AlertTriangle, Info } from "lucide-react";
import { CommunityFilter } from "../CommunityFilter";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { SearchFilterBar } from "./match-list/SearchFilterBar";
import { DeletedUsersAlert } from "./match-list/DeletedUsersAlert";
import { ErrorAlert } from "./match-list/ErrorAlert";
import { LoadingState } from "./match-list/LoadingState";
import { EmptyState } from "./match-list/EmptyState";
import { MatchList } from "./match-list/MatchList";
import { MatchDetailsDialog } from "./match-list/MatchDetailsDialog";

export const MatchesList = ({ refreshKey }: { refreshKey?: number }) => {
  const [selectedCommunity, setSelectedCommunity] = useState<string | undefined>();
  const {
    matches,
    loading,
    refreshMatches: fetchMatches,
    error,
  } = useMatchList();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const [lastMatchCount, setLastMatchCount] = useState(0);

  // Ref to track if component is mounted
  const mountedRef = useRef(true);

  // Track matches count and log changes
  useEffect(() => {
    if (matches.length !== lastMatchCount) {
      console.log(`📊 Matches count changed: ${lastMatchCount} → ${matches.length}`);
      console.log("🎯 Current matches:", matches.map(m => ({ id: m.id, users: `${m.user1?.first_name} + ${m.user2?.first_name}`, status: m.status })));
      setLastMatchCount(matches.length);
    }
  }, [matches.length, lastMatchCount, matches]);

  // Debug output to help diagnose issues
  useEffect(() => {
    console.log("MatchesList: State update", {
      matchCount: matches.length,
      hasDeletedUsers: matches.some((m) => m.hasDeletedUsers),
      loading,
      error: error ? (error as Error).message : undefined,
      selectedMatchId: selectedMatch?.id,
      isDialogOpen,
      refreshKey,
      localRefreshKey
    });
  }, [matches, loading, error, selectedMatch, isDialogOpen, refreshKey, localRefreshKey]);

  // Handle external refresh trigger with debouncing
  useEffect(() => {
    if (refreshKey !== undefined) {
      console.log("MatchesList: External refresh triggered with key:", refreshKey);
      setLocalRefreshKey((prev) => prev + 1);

      // Force refresh immediately for external triggers
      if (mountedRef.current) {
        fetchMatches();
      }
    }
  }, [refreshKey, fetchMatches]);

  // Enhanced select match handler with better logging
  const handleSelectMatch = useCallback((match: Match) => {
    console.log("MatchesList: handleSelectMatch called for match:", match.id);
    console.log("Match data:", { user1: match.user1?.first_name, user2: match.user2?.first_name, status: match.status });
    
    setSelectedMatch(match);
    setIsDialogOpen(true);
    
    console.log("MatchesList: State should be updated - selectedMatch set, isDialogOpen set to true");
  }, []);

  // Enhanced close dialog handler
  const handleCloseDialog = useCallback(() => {
    console.log("MatchesList: handleCloseDialog called");
    setIsDialogOpen(false);
    // Small delay to allow animations to complete before clearing selected match
    setTimeout(() => {
      console.log("MatchesList: Clearing selected match");
      if (mountedRef.current) {
        setSelectedMatch(null);
      }
    }, 300);
  }, []);

  // Handle dialog open change
  const handleDialogOpenChange = useCallback((open: boolean) => {
    console.log("MatchesList: handleDialogOpenChange called with:", open);
    setIsDialogOpen(open);
    if (!open) {
      handleCloseDialog();
    }
  }, [handleCloseDialog]);

  // Memoize refresh handler
  const handleRefresh = useCallback(() => {
    console.log("MatchesList: Manual refresh requested");
    setLocalRefreshKey((prev) => prev + 1);
    fetchMatches();
  }, [fetchMatches]);

  // Filter matches based on search term, status, and visibility options
  const filteredMatches = matches.filter((match) => {
    // Skip matches with missing users unless showDeletedUsers is true
    if (match.hasDeletedUsers && !showDeletedUsers) {
      return false;
    }

    // Safe access to user properties with fallbacks
    const user1FirstName = match.user1?.first_name || "Unknown";
    const user1LastName = match.user1?.last_name || "";
    const user2FirstName = match.user2?.first_name || "Unknown";
    const user2LastName = match.user2?.last_name || "";
    const matchRationale = match.rationale || "";

    const matchesSearch =
      !searchTerm ||
      user1FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user1LastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user2FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user2LastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      matchRationale.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || match.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Count matches with deleted users for the alert
  const matchesWithDeletedUsers = matches.filter(
    (m) => m.hasDeletedUsers
  ).length;

  // Handle match update
  const handleMatchUpdate = useCallback(() => {
    console.log("MatchesList: handleMatchUpdate called");
    handleCloseDialog();
    // Refresh after a short delay
    setTimeout(() => {
      if (mountedRef.current) {
        fetchMatches();
      }
    }, 300);
  }, [fetchMatches, handleCloseDialog]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <SearchFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        selectedCommunity={selectedCommunity}
        setSelectedCommunity={setSelectedCommunity}
        handleRefresh={handleRefresh}
        loading={loading}
      />

      <DeletedUsersAlert
        matchesWithDeletedUsers={matchesWithDeletedUsers}
        showDeletedUsers={showDeletedUsers}
        setShowDeletedUsers={setShowDeletedUsers}
      />

      <ErrorAlert error={error} />

      {loading ? (
        <LoadingState />
      ) : matches.length === 0 ? (
        <EmptyState isFiltered={false} />
      ) : filteredMatches.length === 0 ? (
        <EmptyState isFiltered={true} />
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground mb-2">
            Showing {filteredMatches.length} of {matches.length} matches
          </div>
          {filteredMatches.map((match) => (
            <MatchItem
              key={match.id}
              match={match}
              onSelect={handleSelectMatch}
            />
          ))}
        </div>
      )}

      <MatchDetailsDialog
        isOpen={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        selectedMatch={selectedMatch}
        onClose={handleCloseDialog}
        onUpdate={handleMatchUpdate}
      />
    </div>
  );
};
