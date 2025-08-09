
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { Match } from "../types/matches";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { analyzeMatchChat } from "../services/match-completion/matchAnalysisService";
import { updateMatchToCompleted } from "../services/match-completion/matchStatusService";

interface CompletionSectionProps {
  match: Match;
  onMatchCompleted: () => void;
}

export const CompletionSection: React.FC<CompletionSectionProps> = ({ match, onMatchCompleted }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const isAutomaticCompletion = match.completed_by === 'system';

  const handleCompleteMatch = async () => {
    if (!completionNotes.trim()) {
      toast({
        title: "Notes required",
        description: "Please add completion notes before marking as complete",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      console.error('No user found in auth context');
      toast({
        title: "Authentication required",
        description: "You must be logged in to complete matches",
        variant: "destructive"
      });
      return;
    }

    setIsCompleting(true);
    setError(null);
    
    try {
      console.log("Starting match completion process:", {
        matchId: match.id,
        userId: user.id,
        userEmail: user.email
      });
      
      // Step 1: Update the match status using the service
      console.log("Calling updateMatchToCompleted with:", { matchId: match.id, notes: completionNotes, userId: user.id });
      const result = await updateMatchToCompleted(match.id, completionNotes, user.id);
      
      if (!result.success) {
        console.error("Failed to update match:", result.error);
        const errorMessage = result.error?.message || "Failed to update match status";
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      console.log("Match updated successfully, proceeding with additional tasks");
      
      // Step 2: Analyze match chat (non-blocking)
      try {
        await analyzeMatchChat(match.id);
        console.log("Match chat analysis completed");
      } catch (analysisError: any) {
        console.warn("Error analyzing match chat (non-critical):", analysisError);
        // Don't fail the whole process for this
      }

      toast({
        title: "Match completed",
        description: "Match has been marked as completed successfully"
      });
      
      // Clear completion notes and refresh
      setCompletionNotes("");
      onMatchCompleted();
      
    } catch (err: any) {
      console.error("Error in match completion process:", err);
      const errorMessage = err?.message || error || "Failed to complete match. Please try again.";
      setError(errorMessage);
      
      toast({
        title: "Error completing match",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (match.status === 'completed' && match.completion_notes) {
    return (
      <div className="pt-4 border-t">
        <div className="flex items-center space-x-2 mb-2">
          <h4 className="font-medium">Completion Notes:</h4>
          {isAutomaticCompletion && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
              Auto-completed via sideby
            </Badge>
          )}
        </div>
        <p className="text-gray-600">{match.completion_notes}</p>
        <p className="text-sm text-gray-500 mt-2">
          Completed on: {match.completed_at ? new Date(match.completed_at).toLocaleDateString() : 'Unknown'}
        </p>
        
        {isAutomaticCompletion && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
            <p className="text-sm text-blue-700 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              This match was automatically completed based on a sideby session between the participants.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (match.status !== 'completed' && match.status !== 'deleted') {
    return (
      <div className="pt-4 border-t">
        <h4 className="font-medium mb-2">Complete Match</h4>
        <Textarea
          value={completionNotes}
          onChange={(e) => setCompletionNotes(e.target.value)}
          placeholder="Add completion notes..."
          className="mb-2"
        />
        {error && (
          <div className="bg-red-50 p-3 rounded-md text-red-800 text-sm mb-4 border border-red-200">
            <strong>Error:</strong> {error}
            <div className="text-xs mt-1 text-red-600">
              Please try again or contact support if the issue persists.
            </div>
          </div>
        )}
        <Button 
          onClick={handleCompleteMatch}
          disabled={!completionNotes.trim() || isCompleting}
          className="w-full"
        >
          {isCompleting ? "Completing..." : "Mark as Complete"}
        </Button>
      </div>
    );
  }

  return null;
};
