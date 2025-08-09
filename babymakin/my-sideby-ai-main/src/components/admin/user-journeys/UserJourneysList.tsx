
import React from "react";
import { UserJourneyList } from "./UserJourneyList";
import { UserJourney as ListUserJourney } from "./UserJourneyList";
import { UserJourney as TypesUserJourney } from "./types";
import { useJourneyFilters } from "./hooks/useJourneyFilters";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV } from "@/utils/csvExport";
import { useToast } from "@/hooks/use-toast";

interface UserJourneysListProps {
  journeys: TypesUserJourney[];
  loading: boolean;
  onRefresh: () => void;
  selectedStage?: string;
  searchQuery?: string;
  dateRange?: { from?: Date; to?: Date };
}

// Transform UserJourney from types to UserJourneyList format
const transformJourney = (journey: TypesUserJourney): ListUserJourney => ({
  id: journey.id,
  firstName: journey.first_name || journey.firstName || '',
  lastName: journey.last_name || journey.lastName || '',
  email: journey.email,
  stage: journey.stage,
  daysSinceRegistration: journey.daysSinceRegistration || 0,
  matchCount: journey.match_count || journey.matchCount || 0,
  lastActive: journey.lastActive,
  pacingLevel: journey.pacingLevel,
  hasCompletedReflection: journey.hasMatchActivity,
});

export const UserJourneysList: React.FC<UserJourneysListProps> = ({
  journeys,
  loading,
  onRefresh,
  selectedStage = "all",
  searchQuery = "",
  dateRange = {}
}) => {
  const { toast } = useToast();
  
  // Apply filters to the original journeys first
  const { filteredJourneys } = useJourneyFilters({
    journeys,
    selectedStage,
    searchQuery,
    dateRange,
  });
  
  // Then transform the filtered results
  const transformedJourneys = filteredJourneys.map(transformJourney);
  
  const handleUserSelect = (userId: string) => {
    console.log('User selected:', userId);
    // Add any user selection logic here if needed
  };

  const handleExportCSV = () => {
    if (transformedJourneys.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no user journeys to export based on current filters.",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for export with more readable column names
    const exportData = transformedJourneys.map(journey => ({
      'Name': `${journey.firstName} ${journey.lastName}`.trim(),
      'Email': journey.email,
      'Journey Stage': journey.stage,
      'Days Since Registration': journey.daysSinceRegistration,
      'Match Count': journey.matchCount,
      'Pacing Level': journey.pacingLevel || 'Not Set',
      'Has Completed Reflection': journey.hasCompletedReflection ? 'Yes' : 'No',
      'Last Active': journey.lastActive || 'Never'
    }));

    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `user-journeys-${currentDate}.csv`;
    
    exportToCSV(exportData, filename);
    
    toast({
      title: "Export successful",
      description: `${transformedJourneys.length} user journeys exported to ${filename}`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {transformedJourneys.length} user{transformedJourneys.length !== 1 ? 's' : ''} found
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          size="sm"
          disabled={loading || transformedJourneys.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      <UserJourneyList
        journeys={transformedJourneys}
        loading={loading}
        onUserSelect={handleUserSelect}
        selectedStage={selectedStage}
        searchQuery={searchQuery}
        dateRange={dateRange}
      />
    </div>
  );
};
