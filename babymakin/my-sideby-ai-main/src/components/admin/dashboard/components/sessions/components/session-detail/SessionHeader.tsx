
import React from "react";
import { UpduoSession } from "@/hooks/useUpduoSessions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MessageSquare, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SessionHeaderProps {
  session: UpduoSession;
  hasTranscript: boolean;
}

export const SessionHeader = ({ session, hasTranscript }: SessionHeaderProps) => {
  // Format the date in a more readable way
  const formattedDate = format(new Date(session.createdAt), 'MMMM d, yyyy');
  
  // Calculate duration in minutes and seconds
  const minutes = Math.floor(session.duration / 60);
  const seconds = session.duration % 60;
  const formattedDuration = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}${seconds > 0 ? ` ${seconds} ${seconds === 1 ? 'second' : 'seconds'}` : ''}`;

  const { toast } = useToast();

  const handleExportTranscript = () => {
    if (!hasTranscript || !session.transcriptContents || session.transcriptContents.length === 0) {
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

  return (
    <div className="bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-xl p-6 mb-6 border-2 border-brand-primary/30 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-black text-brand-primary font-display mb-1">Session Summary</h2>
          <p className="text-muted-foreground font-bold">
            {session.type === "PAIR" ? "Peer Learning Session" : "Reflection Session"}
          </p>
        </div>
        <div className="flex space-x-3">
          {hasTranscript && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2 font-bold shadow-sm"
              onClick={handleExportTranscript}
            >
              <FileDown className="h-4 w-4" />
              <span>Export</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Date info */}
        <div className="flex items-center gap-3 bg-white/80 p-3 rounded-xl shadow-sm border border-brand-primary/20">
          <div className="bg-brand-primary/20 p-2 rounded-full">
            <Calendar className="h-5 w-5 text-brand-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Date</p>
            <p className="text-sm font-black text-foreground">{formattedDate}</p>
          </div>
        </div>
        
        {/* Duration info */}
        <div className="flex items-center gap-3 bg-white/80 p-3 rounded-xl shadow-sm border border-brand-primary/20">
          <div className="bg-brand-secondary/20 p-2 rounded-full">
            <Clock className="h-5 w-5 text-brand-secondary" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Duration</p>
            <p className="text-sm font-black text-foreground">{formattedDuration}</p>
          </div>
        </div>
        
        {/* Session type */}
        <div className="flex items-center gap-3 bg-white/80 p-3 rounded-xl shadow-sm border border-brand-primary/20">
          <div className="bg-brand-tertiary/20 p-2 rounded-full">
            <MessageSquare className="h-5 w-5 text-brand-tertiary" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Type</p>
            <Badge 
              variant={session.type === "PAIR" ? "default" : "secondary"}
              className="mt-1 text-xs font-black"
            >
              {session.type === "PAIR" ? "Peer Session" : "Reflection"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
