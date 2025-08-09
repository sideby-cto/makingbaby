
import React, { useState, useEffect } from "react";
import { Profile } from "./types/matchmaking";
import { SearchBar } from "./components/SearchBar";
import { useUserProfilesData } from "./hooks/useUserProfilesData";
import { useDebounce } from "@/hooks/useDebounce";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useWeeklyMatchCandidates } from "./hooks/useWeeklyMatchCandidates";
import { UsersGridFilters } from "./components/UsersGridFilters";
import { UsersGridContent } from "./components/UsersGridContent";
import { filterProfiles } from "./components/UsersGridFilterLogic";

interface UsersGridProps {
  onUserSelect: (user: Profile) => void;
  selectedCommunity?: string;
  compact?: boolean;
  includeAdminUsers?: boolean;
  includeDeletedUsers?: boolean;
  selectedUserIds?: string[]; // New prop to track selected users
  showSelectionIndicators?: boolean; // New prop to show selection indicators
  enableDragAndDrop?: boolean; // New prop for drag and drop functionality
}

export const UsersGrid: React.FC<UsersGridProps> = ({ 
  onUserSelect, 
  selectedCommunity: initialSelectedCommunity,
  compact = false,
  includeAdminUsers = true,
  includeDeletedUsers = false,
  selectedUserIds = [],
  showSelectionIndicators = false,
  enableDragAndDrop = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string>(initialSelectedCommunity || "all");
  const [error, setError] = useState<string | null>(null);
  const [showOnlyReflectionCompleted, setShowOnlyReflectionCompleted] = useState(true);
  const [showAdminUsers, setShowAdminUsers] = useState(true);
  const [showOnlyUnmatched, setShowOnlyUnmatched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = compact ? 12 : 8;

  const { candidateIds: weeklyCandidates } = useWeeklyMatchCandidates();
  
  const {
    profiles,
    loading,
    isRefreshing,
    handleRefresh
  } = useUserProfilesData({ 
    selectedCommunity: selectedCommunity === "all" ? undefined : selectedCommunity,
    selectedCrew,
    includeAdminUsers: true,
    includeDeletedUsers
  });

  useEffect(() => {
    // Log for debugging
    console.log(`UsersGrid: Fetched ${profiles.length} profiles`);
    console.log("UsersGrid: includeDeletedUsers =", includeDeletedUsers);
    
    // Check if erica@sideby.ai is in the profiles
    const hasErica = profiles.some(p => p.email === 'erica@sideby.ai');
    console.log("UsersGrid: hasErica =", hasErica);
    
    if (profiles.length === 0 && !loading) {
      console.log("UsersGrid: No profiles found but not loading");
    }
  }, [profiles, loading, includeDeletedUsers]);

  const filteredProfiles = filterProfiles(profiles, {
    showAdminUsers,
    showOnlyReflectionCompleted,
    showOnlyUnmatched,
    debouncedSearchTerm
  });

  // Pagination
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const paginatedProfiles = filteredProfiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, showOnlyReflectionCompleted, selectedCrew, showAdminUsers, selectedCommunity, showOnlyUnmatched]);

  const handleUserCardClick = (user: Profile) => {
    // This function is called when a user card is clicked (not dragged)
    onUserSelect(user);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-3">
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      
      <UsersGridFilters
        selectedCommunity={selectedCommunity}
        onCommunityChange={setSelectedCommunity}
        selectedCrew={selectedCrew}
        onCrewSelect={setSelectedCrew}
        showOnlyUnmatched={showOnlyUnmatched}
        onUnmatchedToggle={setShowOnlyUnmatched}
        showOnlyReflectionCompleted={showOnlyReflectionCompleted}
        onReflectionToggle={setShowOnlyReflectionCompleted}
        showAdminUsers={showAdminUsers}
        onAdminUsersToggle={setShowAdminUsers}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className={compact ? "relative overflow-hidden p-0.5" : ""} style={{ minHeight: compact ? '300px' : '400px' }}>
        <UsersGridContent
          loading={loading}
          profiles={filteredProfiles}
          paginatedProfiles={paginatedProfiles}
          weeklyCandidates={weeklyCandidates}
          compact={compact}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onUserClick={handleUserCardClick}
          includeDeletedUsers={includeDeletedUsers}
          selectedCommunity={selectedCommunity}
          selectedCrew={selectedCrew}
          showOnlyReflectionCompleted={showOnlyReflectionCompleted}
          showOnlyUnmatched={showOnlyUnmatched}
          showAdminUsers={showAdminUsers}
          selectedUserIds={selectedUserIds}
          showSelectionIndicators={showSelectionIndicators}
          enableDragAndDrop={enableDragAndDrop}
        />
      </div>
    </div>
  );
}
