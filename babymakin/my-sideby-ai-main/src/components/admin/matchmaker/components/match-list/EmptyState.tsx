
import React from "react";

interface EmptyStateProps {
  isFiltered: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isFiltered }) => {
  if (isFiltered) {
    return (
      <div className="py-10 text-center text-gray-500">
        No matches found matching your filters. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <div className="py-10 text-center text-gray-500">
      No matches found. Create your first match above.
    </div>
  );
};
