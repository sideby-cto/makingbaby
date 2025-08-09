
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserJourney } from "./types";
import { KanbanBoard } from "./kanban/components/KanbanBoard";
import { useJourneyFilters } from "./hooks/useJourneyFilters";

interface UserJourneyKanbanProps {
  initialJourneys: UserJourney[];
  onJourneyUpdate: () => void;
  selectedStage?: string;
  searchQuery?: string;
  dateRange?: { from?: Date; to?: Date };
}

export const UserJourneyKanban: React.FC<UserJourneyKanbanProps> = ({
  initialJourneys,
  onJourneyUpdate,
  selectedStage = "all",
  searchQuery = "",
  dateRange = {},
}) => {
  const { filteredJourneys } = useJourneyFilters({
    journeys: initialJourneys,
    selectedStage,
    searchQuery,
    dateRange,
  });

  if (!initialJourneys.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 p-8">
        <Alert>
          <AlertDescription>
            No user journeys found. Users will appear here once they start their journey.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <KanbanBoard 
        journeys={filteredJourneys}
        onJourneyUpdate={onJourneyUpdate}
      />
    </div>
  );
};
