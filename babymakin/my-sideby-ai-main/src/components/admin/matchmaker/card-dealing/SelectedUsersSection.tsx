
import React from 'react';
import { Profile } from '../types/matchmaking';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface SelectedUsersSectionProps {
  selectedUsers: Profile[];
  onUserSelect: (user: Profile) => void;
  onClearAll: () => void;
}

export const SelectedUsersSection: React.FC<SelectedUsersSectionProps> = ({
  selectedUsers,
  onUserSelect,
  onClearAll
}) => {
  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">2. Selected Users ({selectedUsers.length})</span>
        </div>
        {selectedUsers.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        )}
      </div>
      
      {selectedUsers.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge
              key={user.id}
              variant="secondary"
              className="cursor-pointer hover:bg-red-100 bg-blue-100 text-blue-800"
              onClick={() => onUserSelect(user)}
            >
              {`${user.first_name} ${user.last_name}` || user.email}
              <span className="ml-1 text-red-500">×</span>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-blue-700 text-sm">No users selected. Select users from the grid above.</p>
      )}
    </div>
  );
};
