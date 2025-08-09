
import React from 'react';
import { AlertCircle, User } from "lucide-react";

interface EmptyStateProps {
  hasFilters: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
      {hasFilters ? (
        <>
          <AlertCircle className="h-10 w-10 mb-3 opacity-50" />
          <p>No users found matching your filters.</p>
          <p className="text-sm mt-2">Try adjusting your search or filter criteria.</p>
        </>
      ) : (
        <>
          <User className="h-10 w-10 mb-3 opacity-50" />
          <p>No users have been notified yet.</p>
          <p className="text-sm mt-2">Notifications will appear here when the journey monitor runs.</p>
        </>
      )}
    </div>
  );
};
