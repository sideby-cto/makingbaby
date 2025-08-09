
import React from "react";
import { UpduoSession } from "@/hooks/useUpduoSessions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useEnhancedTranscriptAnalysis, useGenerateEnhancedAnalysis } from "@/hooks/useEnhancedTranscriptAnalysis";
import { EnhancedAnalysisDisplay } from "@/components/admin/sessions/EnhancedAnalysisDisplay";

interface SessionEnhancedAnalysisProps {
  session: UpduoSession;
}

export const SessionEnhancedAnalysis = ({ session }: SessionEnhancedAnalysisProps) => {
  // Get transcript ID from the session's transcriptContents array
  const transcriptId = session.transcriptContents && session.transcriptContents.length > 0 
    ? session.id // Use session ID as transcript ID since transcript_id doesn't exist on UpduoTranscriptContent
    : undefined;
  
  // Get user ID from the session's users array (first user)
  const userId = session.users && session.users.length > 0 ? session.users[0].id : undefined;
  
  const { 
    data: analysis, 
    isLoading: isLoadingAnalysis, 
    error: analysisError 
  } = useEnhancedTranscriptAnalysis(transcriptId);
  
  const { 
    mutate: generateAnalysis, 
    isPending: isGenerating 
  } = useGenerateEnhancedAnalysis();

  const handleGenerateAnalysis = () => {
    if (!transcriptId || !userId) return;
    
    generateAnalysis({
      transcriptId,
      userId,
      sessionTitle: session.knowledgeNodes?.[0]?.name || "Session Analysis",
      skipCache: false
    });
  };

  const handleRegenerateAnalysis = () => {
    if (!transcriptId || !userId) return;
    
    generateAnalysis({
      transcriptId,
      userId,
      sessionTitle: session.knowledgeNodes?.[0]?.name || "Session Analysis",
      skipCache: true
    });
  };

  if (!transcriptId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No transcript ID found for this session. Enhanced analysis requires a stored transcript.
        </AlertDescription>
      </Alert>
    );
  }

  if (!userId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No user ID found for this session. Enhanced analysis requires a valid user.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoadingAnalysis) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading enhanced analysis...</span>
        </div>
      </div>
    );
  }

  if (analysisError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load enhanced analysis: {analysisError.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Enhanced Transcript Analysis
          </CardTitle>
          <CardDescription>
            Generate advanced semantic analysis including emotional sentiment, engagement patterns, 
            learning moments, and personality insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGenerateAnalysis}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Analysis...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Generate Enhanced Analysis
              </>
            )}
          </Button>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>This analysis will include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Emotional sentiment and emotional journey</li>
              <li>Engagement patterns and participation metrics</li>
              <li>Semantic topic identification with embeddings</li>
              <li>Expertise indicators and domain knowledge</li>
              <li>Learning moments and breakthroughs</li>
              <li>Communication and learning style analysis</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">Enhanced Analysis Complete</h3>
        </div>
        <Button 
          variant="outline"
          onClick={handleRegenerateAnalysis}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              Regenerate Analysis
            </>
          )}
        </Button>
      </div>
      
      <EnhancedAnalysisDisplay analysis={analysis} />
    </div>
  );
};
