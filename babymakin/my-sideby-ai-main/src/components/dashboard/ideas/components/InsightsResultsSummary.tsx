
import React from "react";

interface InsightsResultsSummaryProps {
  filteredCount: number;
  totalCount: number;
  filter: string;
  filterOptions: Array<{ id: string; label: string; count: number }>;
}

export const InsightsResultsSummary = ({
  filteredCount,
  totalCount,
  filter,
  filterOptions
}: InsightsResultsSummaryProps) => {
  if (filteredCount === totalCount) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="text-sm text-blue-700 font-medium">
        Showing {filteredCount} of {totalCount} ideas
        {filter !== "all" && (
          <span className="text-blue-600">
            {" "}• Filtered by "{filterOptions.find(f => f.id === filter)?.label}"
          </span>
        )}
      </p>
    </div>
  );
};
