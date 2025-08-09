
import { useMemo } from 'react';
import { UserJourney } from '../types';

interface UseJourneyFiltersProps {
  journeys: UserJourney[];
  selectedStage: string;
  searchQuery: string;
  dateRange: { from?: Date; to?: Date };
}

export const useJourneyFilters = ({
  journeys,
  selectedStage,
  searchQuery,
  dateRange,
}: UseJourneyFiltersProps) => {
  const filteredJourneys = useMemo(() => {
    let filtered = journeys;

    // Filter by stage
    if (selectedStage !== "all") {
      filtered = filtered.filter(journey => journey.stage === selectedStage);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(journey => {
        const fullName = `${journey.first_name || journey.firstName || ''} ${journey.last_name || journey.lastName || ''}`.toLowerCase();
        const email = (journey.email || '').toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    }

    // Filter by date range
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(journey => {
        const journeyDate = new Date(journey.last_update || journey.created_at);
        
        if (dateRange.from && journeyDate < dateRange.from) {
          return false;
        }
        
        if (dateRange.to && journeyDate > dateRange.to) {
          return false;
        }
        
        return true;
      });
    }

    return filtered;
  }, [journeys, selectedStage, searchQuery, dateRange]);

  return { filteredJourneys };
};
