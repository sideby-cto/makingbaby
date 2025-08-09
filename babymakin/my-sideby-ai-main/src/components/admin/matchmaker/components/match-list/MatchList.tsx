
import React from "react";
import { Match } from "../../types/matches";
import { MatchItem } from "../MatchItem";

interface MatchListProps {
  matches: Match[];
  localRefreshKey: number;
  onSelectMatch: (match: Match) => void;
}

export const MatchList: React.FC<MatchListProps> = ({ 
  matches, 
  localRefreshKey,
  onSelectMatch
}) => {
  // Enhanced handler for match selection with logging
  const handleSelectMatch = (match: Match) => {
    console.log("MatchList: Match selected:", match.id);
    // Ensure we're calling the passed-in handler
    onSelectMatch(match);
  };

  return (
    <div className="space-y-2" key={`matches-list-${localRefreshKey}`}>
      {matches.map((match) => (
        <MatchItem 
          key={`${match.id}-${localRefreshKey}`} 
          match={match} 
          onSelect={handleSelectMatch} 
        />
      ))}
    </div>
  );
};
