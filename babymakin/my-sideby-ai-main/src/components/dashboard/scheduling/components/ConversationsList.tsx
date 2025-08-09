
import React from "react";
import { MatchData } from "../types";
import { ConversationCard } from "./ConversationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle } from "lucide-react";

interface ConversationsListProps {
  matches: MatchData[];
  selectedMatchId: string | null;
  onSelectMatch: (matchId: string) => void;
  userId: string;
  isLoading: boolean;
}

export const ConversationsList = ({
  matches,
  selectedMatchId,
  onSelectMatch,
  userId,
  isLoading
}: ConversationsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3 p-3" data-testid="conversations-loading">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center" data-testid="no-conversations">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No conversations found</h3>
        <p className="text-sm text-muted-foreground">
          Your matches will appear here when they're ready to chat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3" data-testid="conversations-list">
      {matches.map((match) => (
        <button
          key={match.id}
          onClick={() => onSelectMatch(match.id)}
          className={`w-full text-left transition-colors rounded-lg ${
            selectedMatchId === match.id ? 'bg-muted' : 'hover:bg-muted/50'
          }`}
          data-testid={`conversation-item-${match.id}`}
        >
          <ConversationCard
            match={match}
            isSelected={selectedMatchId === match.id}
            onClick={() => onSelectMatch(match.id)}
            userId={userId}
          />
        </button>
      ))}
    </div>
  );
};
