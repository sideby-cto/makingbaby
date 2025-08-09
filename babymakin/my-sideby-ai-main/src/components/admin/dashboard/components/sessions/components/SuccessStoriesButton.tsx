
import React from "react";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { useStudentSuccessAnalysis } from "@/hooks/useStudentSuccessAnalysis";
import type { UpduoSession } from "@/hooks/useUpduoSessions";

interface SuccessStoriesButtonProps {
  session: UpduoSession;
  onAnalysisComplete?: (result: any) => void;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

export const SuccessStoriesButton = ({ 
  session, 
  onAnalysisComplete,
  variant = "outline",
  size = "default"
}: SuccessStoriesButtonProps) => {
  const { analyzeSession, isAnalyzing } = useStudentSuccessAnalysis();

  const handleAnalyze = async () => {
    const result = await analyzeSession(session);
    if (result && onAnalysisComplete) {
      onAnalysisComplete(result);
    }
  };

  const hasTranscript = session.transcriptContents && session.transcriptContents.length > 0;
  const hasUsers = session.users && session.users.length > 0;
  const canAnalyze = hasTranscript && hasUsers;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAnalyze}
      disabled={isAnalyzing || !canAnalyze}
      className="gap-2"
    >
      {isAnalyzing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Brain className="h-4 w-4" />
      )}
      {isAnalyzing ? "Analyzing..." : "Analyze Success Stories"}
    </Button>
  );
};
