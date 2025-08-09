import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface MatchRationaleCardProps {
  rationale: string | null;
  matchId?: string;
  createdAt?: string;
}
export const MatchRationaleCard = ({
  rationale,
  matchId,
  createdAt
}: MatchRationaleCardProps) => {
  if (!rationale) return null;
  
  const formattedDate = createdAt 
    ? format(new Date(createdAt), "MMMM d, yyyy") 
    : "";
  
  return <Card className="mx-3 mt-3 mb-0 bg-classroom-cream border-classroom-border">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-sm font-medium text-palette-book-brown">Why you were matched:</h4>
          {formattedDate && (
            <span className="text-xs text-palette-book-brown">Matched {formattedDate}</span>
          )}
        </div>
        <p className="text-sm text-palette-book-brown">{rationale}</p>
      </CardContent>
    </Card>;
};