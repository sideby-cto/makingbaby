import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MatchSuggestionsProps {
  searchTerm: string;
}

export const MatchSuggestions: React.FC<MatchSuggestionsProps> = ({ searchTerm }) => {
  return (
    <Card data-testid="match-suggestions-card">
      <CardHeader>
        <CardTitle data-testid="match-suggestions-title">Match Suggestions</CardTitle>
      </CardHeader>
      <CardContent data-testid="match-suggestions-content">
        <p className="text-muted-foreground">
          Match suggestions feature is coming soon.
          {searchTerm && ` Searching for: "${searchTerm}"`}
        </p>
      </CardContent>
    </Card>
  );
};