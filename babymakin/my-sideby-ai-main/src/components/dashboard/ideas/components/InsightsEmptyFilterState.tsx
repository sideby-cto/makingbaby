
import React from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface InsightsEmptyFilterStateProps {
  onClearFilter: () => void;
}

export const InsightsEmptyFilterState = ({ onClearFilter }: InsightsEmptyFilterStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Filter className="h-6 w-6 text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No ideas match this filter</h3>
      <p className="text-gray-600 mb-4">Try adjusting your filter or clearing it to see all ideas.</p>
      <Button
        variant="outline"
        onClick={onClearFilter}
        className="border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        Clear filter
      </Button>
    </div>
  );
};
