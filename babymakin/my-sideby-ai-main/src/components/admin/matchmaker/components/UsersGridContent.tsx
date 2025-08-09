
import React from "react";
import { SelectableUserCard } from "./SelectableUserCard";
import { LoadingGrid } from "./LoadingGrid";
import { UsersGridPagination } from "./UsersGridPagination";
import { Profile } from "../types/matchmaking";

interface UsersGridContentProps {
  loading: boolean;
  profiles: Profile[];
  paginatedProfiles: Profile[];
  weeklyCandidates: string[];
  compact?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onUserClick: (user: Profile) => void;
  includeDeletedUsers: boolean;
  selectedCommunity: string;
  selectedCrew: string | null;
  showOnlyReflectionCompleted: boolean;
  showOnlyUnmatched: boolean;
  showAdminUsers: boolean;
  selectedUserIds?: string[];
  showSelectionIndicators?: boolean;
  enableDragAndDrop?: boolean;
}

export const UsersGridContent: React.FC<UsersGridContentProps> = ({
  loading,
  profiles,
  paginatedProfiles,
  weeklyCandidates,
  compact = false,
  currentPage,
  totalPages,
  onPageChange,
  onUserClick,
  includeDeletedUsers,
  selectedCommunity,
  selectedCrew,
  showOnlyReflectionCompleted,
  showOnlyUnmatched,
  showAdminUsers,
  selectedUserIds = [],
  showSelectionIndicators = false,
  enableDragAndDrop = false
}) => {
  if (loading) {
    return (
      <LoadingGrid 
        compact={compact}
        includeDeletedUsers={includeDeletedUsers}
        selectedCommunity={selectedCommunity}
        selectedCrew={selectedCrew}
        showOnlyReflectionCompleted={showOnlyReflectionCompleted}
        showOnlyUnmatched={showOnlyUnmatched}
        showAdminUsers={showAdminUsers}
        data-testid="users-grid-loading"
      />
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-8" data-testid="no-users-found">
        <p className="text-gray-500">No users found matching the current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="users-grid-content">
      <div className={`grid gap-3 ${
        compact 
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      }`} data-testid="users-grid">
        {paginatedProfiles.map((profile) => (
          <SelectableUserCard
            key={profile.id}
            profile={profile}
            onClick={() => onUserClick(profile)}
            compact={compact}
            isSelected={showSelectionIndicators && selectedUserIds.includes(profile.id)}
            isDraggable={enableDragAndDrop}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <UsersGridPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
