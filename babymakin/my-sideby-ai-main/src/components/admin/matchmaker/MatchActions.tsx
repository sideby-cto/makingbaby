
import React from "react";
import { Match } from "./types/matches";
import { EmailSection } from "./actions/EmailSection";

import { CompletionSection } from "./actions/CompletionSection";
import { useMatchRealtime } from "./hooks/useMatchRealtime";

interface MatchActionsProps {
  match: Match;
  onActionCompleted: () => void;
}

export const MatchActions: React.FC<MatchActionsProps> = ({ match, onActionCompleted }) => {
  const { currentMatch } = useMatchRealtime(match, onActionCompleted);

  return (
    <div className="space-y-4">
      {/* Email sending section */}
      <EmailSection 
        match={currentMatch} 
        onEmailSent={onActionCompleted} 
      />
      

      {/* Match completion section */}
      <CompletionSection 
        match={currentMatch} 
        onMatchCompleted={onActionCompleted} 
      />
    </div>
  );
};
