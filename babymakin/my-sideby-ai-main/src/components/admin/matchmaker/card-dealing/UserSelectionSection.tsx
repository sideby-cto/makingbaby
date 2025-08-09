
import React from 'react';
import { UsersGrid } from '../UsersGrid';
import { Profile } from '../types/matchmaking';

interface UserSelectionSectionProps {
  onUserSelect: (user: Profile) => void;
  selectedUserIds: string[];
}

export const UserSelectionSection: React.FC<UserSelectionSectionProps> = ({
  onUserSelect,
  selectedUserIds
}) => {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-lg font-semibold mb-4">1. Select Users</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click to select users or drag them to the matching area below
      </p>
      <UsersGrid 
        onUserSelect={onUserSelect}
        compact={true}
        includeAdminUsers={true}
        includeDeletedUsers={false}
        selectedUserIds={selectedUserIds}
        showSelectionIndicators={true}
        enableDragAndDrop={true}
      />
    </div>
  );
};
