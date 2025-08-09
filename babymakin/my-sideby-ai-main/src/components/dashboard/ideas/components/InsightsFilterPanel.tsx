
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InsightsFilterPanelProps {
  filter: string;
  filterOptions: Array<{ id: string; label: string; count: number }>;
  onFilterChange: (filter: string) => void;
  onClose: () => void;
}

export const InsightsFilterPanel = ({
  filter,
  filterOptions,
  onFilterChange,
  onClose
}: InsightsFilterPanelProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Filter Ideas</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-auto p-1 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {filterOptions.map(({ id, label, count }) => (
          <Button
            key={id}
            variant={filter === id ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(id)}
            disabled={count === 0}
            className={`justify-start h-auto p-3 ${
              filter === id 
                ? "bg-sideby-orange-500 hover:bg-sideby-orange-600 text-white" 
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } ${count === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex flex-col items-start w-full">
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs opacity-75">{count} ideas</span>
            </div>
          </Button>
        ))}
      </div>
      {filter !== "all" && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange("all")}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear filter
          </Button>
        </div>
      )}
    </div>
  );
};
