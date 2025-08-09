
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Brain, AlertCircle, FileSearch, Users } from "lucide-react";
import { Match } from "./types/matches";
import { useTouchpointAnalysis } from "./touchpoints/hooks/useTouchpointAnalysis";
import { AnalysisStarter } from "./touchpoints/components/AnalysisStarter";
import { AnalysisStatus } from "./touchpoints/components/AnalysisStatus";
import { TouchpointChat } from "./touchpoints/components/TouchpointChat";
import { checkAndLinkTranscriptsForMatch } from "@/services/transcriptLinking";
import { useToast } from "@/hooks/use-toast";

interface TouchpointAnalysisProps {
  match: Match;
}

export const TouchpointAnalysis: React.FC<TouchpointAnalysisProps> = ({ match }) => {
  const {
    analysis,
    messages,
    isLoading,
    error,
    startAnalysis,
    sendMessage
  } = useTouchpointAnalysis(match.id);

  const [transcriptStatus, setTranscriptStatus] = useState<{
    checked: boolean;
    hasTranscripts: boolean;
    details?: any;
    checking: boolean;
  }>({
    checked: false,
    hasTranscripts: false,
    checking: false
  });

  const { toast } = useToast();

  // Check transcript availability when component mounts
  useEffect(() => {
    const checkTranscripts = async () => {
      if (transcriptStatus.checked || transcriptStatus.checking) return;

      setTranscriptStatus(prev => ({ ...prev, checking: true }));

      try {
        const result = await checkAndLinkTranscriptsForMatch(match.id);
        const hasAnyTranscripts = result.results.some(r => r.success && (r.transcriptCount || 0) > 0);
        
        setTranscriptStatus({
          checked: true,
          hasTranscripts: hasAnyTranscripts,
          details: result,
          checking: false
        });
      } catch (error) {
        console.error('Error checking transcripts:', error);
        setTranscriptStatus({
          checked: true,
          hasTranscripts: false,
          checking: false
        });
      }
    };

    checkTranscripts();
  }, [match.id, transcriptStatus.checked, transcriptStatus.checking]);

  const handleRecheckTranscripts = async () => {
    setTranscriptStatus(prev => ({ ...prev, checking: true }));
    
    try {
      const result = await checkAndLinkTranscriptsForMatch(match.id);
      const hasAnyTranscripts = result.results.some(r => r.success && (r.transcriptCount || 0) > 0);
      
      setTranscriptStatus({
        checked: true,
        hasTranscripts: hasAnyTranscripts,
        details: result,
        checking: false
      });

      toast({
        title: "Transcript Check Complete",
        description: hasAnyTranscripts 
          ? "Transcripts found for this match" 
          : "No transcripts available yet",
      });
    } catch (error) {
      console.error('Error rechecking transcripts:', error);
      setTranscriptStatus(prev => ({ ...prev, checking: false }));
      toast({
        title: "Error",
        description: "Failed to check transcript availability",
        variant: "destructive"
      });
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Show transcript availability check results
  if (!transcriptStatus.hasTranscripts && transcriptStatus.checked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              Transcript Availability Check
            </div>
            <Badge variant="outline">No Transcripts</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No session transcripts are available for analysis. Users may need to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Complete reflection sessions in sideby</li>
                <li>Have their Upduo accounts properly linked</li>
                <li>Wait for transcript data to be imported</li>
              </ul>
            </AlertDescription>
          </Alert>

          {transcriptStatus.details && (
            <div className="space-y-2 mb-4">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Status Details
              </h4>
              {transcriptStatus.details.results.map((result: any, index: number) => (
                <div key={index} className="text-sm p-2 border rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {match.user1?.id === result.userId ? match.user1?.first_name : match.user2?.first_name}
                    </span>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? `${result.transcriptCount || 0} transcripts` : "No transcripts"}
                    </Badge>
                  </div>
                  {result.error && (
                    <p className="text-red-600 text-xs mt-1">{result.error}</p>
                  )}
                  {result.suggestion && (
                    <p className="text-blue-600 text-xs mt-1">{result.suggestion}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button 
            onClick={handleRecheckTranscripts} 
            disabled={transcriptStatus.checking}
            variant="outline"
            className="w-full"
          >
            {transcriptStatus.checking ? "Checking..." : "Recheck Transcript Availability"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <AnalysisStarter
        match={match}
        onStartAnalysis={startAnalysis}
        isLoading={isLoading}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Touchpoint Analysis
          </div>
          <Badge variant={analysis.status === 'completed' ? 'default' : analysis.status === 'failed' ? 'destructive' : 'secondary'}>
            {analysis.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analysis.status === 'failed' && analysis.error_message && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{analysis.error_message}</AlertDescription>
          </Alert>
        )}

        {messages.length > 0 ? (
          <TouchpointChat
            messages={messages}
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        ) : analysis.status === 'completed' ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Analysis completed but no messages found. Try refreshing the page.</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
