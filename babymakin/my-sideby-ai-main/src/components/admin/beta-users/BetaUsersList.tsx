
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BetaUser } from './types';
import { Loader2 } from 'lucide-react';

interface BetaUsersListProps {
  betaUsers: BetaUser[];
  loading: boolean;
  onRemoveUser: (id: string) => void;
  onSelectUser?: (user: BetaUser) => void;
  selectedUserId?: string;
}

export const BetaUsersList: React.FC<BetaUsersListProps> = ({
  betaUsers,
  loading,
  onRemoveUser,
  onSelectUser,
  selectedUserId
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 mb-2">Active Beta Users: {betaUsers.length}</h3>
      {betaUsers.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No active beta users</p>
      ) : (
        <div className="divide-y">
          {betaUsers.map((user) => (
            <div 
              key={user.id} 
              className={`py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 ${selectedUserId === user.id ? 'bg-gray-50' : ''}`}
              onClick={() => onSelectUser && onSelectUser(user)}
            >
              <div>
                <p className="font-medium">
                  {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email || 'Unknown User'}
                </p>
                <div className="flex gap-2 mt-1">
                  {user.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{feature}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={selectedUserId === user.id ? "default" : "secondary"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectUser && onSelectUser(user);
                  }}
                >
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveUser(user.id);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
