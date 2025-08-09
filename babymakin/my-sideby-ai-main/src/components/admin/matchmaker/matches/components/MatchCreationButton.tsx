
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MatchCreationButtonProps {
  isCreating: boolean;
  matchType: 'exact' | 'proximity';
  onCreateMatch: () => Promise<void>;
}

export const MatchCreationButton = ({ isCreating, matchType, onCreateMatch }: MatchCreationButtonProps) => {
  return (
    <Button 
      size="sm" 
      className={`mt-2 sm:mt-0 ${matchType === 'exact' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
      onClick={onCreateMatch}
      disabled={isCreating}
    >
      {isCreating ? (
        <>Creating...</>
      ) : (
        <>Create Match</>
      )}
    </Button>
  );
};
