
import React from "react";
import { UpduoSession } from "@/hooks/useUpduoSessions";
import { MessageSquare, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface SessionTranscriptProps {
  session: UpduoSession;
}

export const SessionTranscript = ({ session }: SessionTranscriptProps) => {
  const hasTranscript = session.transcriptContents && session.transcriptContents.length > 0;
  const { toast } = useToast();
  
  const handleExportTranscript = () => {
    if (!hasTranscript) {
      toast({
        title: "No transcript available",
        description: "This session doesn't have a transcript to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Format transcript data
      const speakerMap = new Map();
      session.users.forEach(user => {
        speakerMap.set(user.id, `${user.firstName} ${user.lastName}`);
      });

      const formattedTranscript = session.transcriptContents.map(entry => {
        const speakerName = speakerMap.get(entry.speaker) || `Speaker ${entry.speaker}`;
        const minutes = Math.floor(entry.startTime / 60);
        const seconds = Math.floor(entry.startTime % 60);
        const timestamp = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        return `[${timestamp}] ${speakerName}: ${entry.text}`;
      }).join('\n\n');

      // Create session metadata
      const formattedDate = format(new Date(session.createdAt), 'MMMM d, yyyy');
      const minutes = Math.floor(session.duration / 60);
      const seconds = session.duration % 60;
      const formattedDuration = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}${seconds > 0 ? ` ${seconds} ${seconds === 1 ? 'second' : 'seconds'}` : ''}`;

      const metadata = [
        `Session Date: ${formattedDate}`,
        `Session Type: ${session.type === "PAIR" ? "Peer Learning Session" : "Reflection Session"}`,
        `Duration: ${formattedDuration}`,
        `Participants: ${session.users.map(u => `${u.firstName} ${u.lastName}`).join(', ')}`,
        `\n--- Transcript ---\n`
      ].join('\n');

      // Combine metadata and transcript
      const fileContent = metadata + formattedTranscript;
      
      // Create file name
      const fileName = `upduo-session-${session.id}-${format(new Date(session.createdAt), 'yyyy-MM-dd')}.txt`;
      
      // Create and download the file
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: "The transcript has been downloaded.",
      });
    } catch (error) {
      console.error("Error exporting transcript:", error);
      toast({
        title: "Export failed",
        description: "There was a problem exporting the transcript.",
        variant: "destructive",
      });
    }
  };
  
  if (!hasTranscript) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-4 text-center">
        <p className="text-muted-foreground">No transcript available for this session.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Conversation Transcript
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={handleExportTranscript}
        >
          <FileDown className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>
      
      <div className="space-y-4 pr-1">
        {session.transcriptContents.map((entry, index) => {
          // Find user by speaker ID
          const speaker = session.users.find(u => u.id === entry.speaker);
          const speakerName = speaker 
            ? `${speaker.firstName} ${speaker.lastName}` 
            : `Speaker ${entry.speaker}`;
          
          // Alternate styling based on speaker for better readability
          const isAlternateSpeaker = index > 0 && entry.speaker !== session.transcriptContents[index-1].speaker;
            
          return (
            <div 
              key={index} 
              className={cn(
                "rounded-lg p-3 max-w-[90%]",
                entry.speaker === session.users[0]?.id 
                  ? "bg-primary/10 ml-auto mr-0 border-l-3 border-primary" 
                  : "bg-secondary/10 mr-auto ml-0 border-l-3 border-secondary",
                isAlternateSpeaker ? "mt-4" : ""
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-xs">
                  {speakerName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.floor(entry.startTime / 60)}:{(entry.startTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <p className="text-xs leading-relaxed">{entry.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
