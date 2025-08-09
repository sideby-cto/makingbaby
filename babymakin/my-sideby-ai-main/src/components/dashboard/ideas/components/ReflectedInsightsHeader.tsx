
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface ReflectedInsightsHeaderProps {
  filteredCount: number;
  totalCount: number;
  filter: string;
  filterOptions: Array<{ id: string; label: string; count: number }>;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const ReflectedInsightsHeader = ({
  filteredCount,
  totalCount,
  filter,
  filterOptions,
  showFilters,
  onToggleFilters
}: ReflectedInsightsHeaderProps) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ideas</h2>
          <p className="text-gray-600 mt-1">
            {filteredCount} of {totalCount} ideas
            {filter !== "all" && ` • Filtered by ${filterOptions.find(f => f.id === filter)?.label}`}
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className="border-sideby-blue-500 text-sideby-blue-600 hover:bg-sideby-blue-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {filter !== "all" && (
            <Badge className="ml-2 bg-sideby-orange-500 text-white text-xs">1</Badge>
          )}
        </Button>
      </div>
    </div>
  );
};
