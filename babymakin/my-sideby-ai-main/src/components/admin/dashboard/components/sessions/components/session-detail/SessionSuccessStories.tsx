import React, { useState } from "react";
import { UpduoSession } from "@/hooks/useUpduoSessions";
import { useStudentSuccessSigns } from "@/hooks/useStudentSuccessSigns";
import { SuccessStoriesButton } from "../SuccessStoriesButton";
import { SuccessStoriesDialog } from "../SuccessStoriesDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SIGN_TYPE_LABELS, CONFIDENCE_LABELS } from "@/types/student-success";
import { Brain, TrendingUp, Users, Calendar } from "lucide-react";

interface SessionSuccessStoriesProps {
  session: UpduoSession;
}

export const SessionSuccessStories = ({ session }: SessionSuccessStoriesProps) => {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Get existing success signs for users in this session
  const userIds = session.users?.map(user => user.id) || [];
  const { data: existingSigns = [], refetch } = useStudentSuccessSigns();

  // Filter signs related to this session or these users
  const sessionRelatedSigns = existingSigns.filter(sign => 
    userIds.includes(sign.student_id) &&
    (sign.metadata?.session_id === session.id || 
     sign.session_timestamp && 
     Math.abs(new Date(sign.session_timestamp).getTime() - session.createdAt * 1000) < 24 * 60 * 60 * 1000) // Within 24 hours
  );

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
    setShowDialog(true);
    refetch(); // Refresh the existing signs
  };

  const hasTranscript = session.transcriptContents && session.transcriptContents.length > 0;

  return (
    <div className="space-y-6">
      {/* Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-brand-primary" />
              AI-Powered Success Signs Analysis
            </div>
            <SuccessStoriesButton 
              session={session}
              onAnalysisComplete={handleAnalysisComplete}
              variant="default"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasTranscript ? (
            <div className="text-sm text-muted-foreground">
              <p>Analyze this session's transcript to automatically identify evidence of student success signs such as persistence, engagement, comprehension, participation, collaboration, and creativity.</p>
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {session.users?.length || 0} participants
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {session.transcriptContents?.length || 0} transcript entries
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>No transcript available for analysis. Transcript data is required to identify student success signs.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Signs */}
      {sessionRelatedSigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-primary" />
              Identified Success Signs ({sessionRelatedSigns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {sessionRelatedSigns.map((sign) => (
                  <div key={sign.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-brand-secondary/20 text-brand-primary">
                        {SIGN_TYPE_LABELS[sign.sign_type]}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {CONFIDENCE_LABELS[sign.confidence_level]}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(sign.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm">{sign.description}</p>
                    
                    {sign.evidence_text && (
                      <blockquote className="text-xs italic border-l-2 border-muted pl-2 text-muted-foreground">
                        "{sign.evidence_text}"
                      </blockquote>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Analysis Dialog */}
      <SuccessStoriesDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        analysisResult={analysisResult}
      />
    </div>
  );
};
