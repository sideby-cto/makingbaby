import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { TranscriptAnalyzer } from "./TranscriptAnalyzer";
import { useTranscripts } from "@/hooks/useTranscripts";

interface TranscriptAnalysisButtonProps {
  studentId: string;
  studentName: string;
}

export const TranscriptAnalysisButton = ({ studentId, studentName }: TranscriptAnalysisButtonProps) => {
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const { data: transcripts = [] } = useTranscripts(studentId);

  const latestTranscript = transcripts[0]; // Get the most recent transcript

  if (!latestTranscript) {
    return (
      <Button variant="outline" size="sm" disabled>
        <FileText className="h-4 w-4 mr-2" />
        No Transcripts Available
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowAnalyzer(true)}>
        <FileText className="h-4 w-4 mr-2" />
        Analyze Transcripts
      </Button>

      <Dialog open={showAnalyzer} onOpenChange={setShowAnalyzer}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Transcript Analysis</DialogTitle>
          </DialogHeader>
          <TranscriptAnalyzer
            transcript={latestTranscript as any}
            studentId={studentId}
            studentName={studentName}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};