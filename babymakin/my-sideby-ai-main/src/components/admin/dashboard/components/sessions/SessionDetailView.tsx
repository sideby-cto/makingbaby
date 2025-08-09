
import React, { useState, useEffect } from "react";
import { UpduoSession } from "@/hooks/useUpduoSessions";
import { SessionHeader } from "./components/session-detail/SessionHeader";
import { SessionTabs } from "./components/session-detail/SessionTabs";
import { useUpduoSessions } from "@/hooks/useUpduoSessions";
import { Button } from "@/components/ui/button";
import { Database, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SessionDetailViewProps {
  session: UpduoSession;
}

export const SessionDetailView = ({ session }: SessionDetailViewProps) => {
  // Check if transcript exists
  const hasTranscript = session.transcriptContents && session.transcriptContents.length > 0;
  const { storeSessionTranscript } = useUpduoSessions(50);
  const { toast } = useToast();
  const [isStoring, setIsStoring] = useState(false);
  
  // Check if this is a reflection session that should be auto-stored
  const isReflectionSession = 
    session.type === "SINGLE" || 
    session.knowledgeNodes?.some(node => 
      node.name?.toLowerCase().includes('welcome') || 
      node.name?.toLowerCase().includes('reflection')
    );
  
  const handleStoreTranscript = async () => {
    try {
      setIsStoring(true);
      toast({
        title: "Storing transcript",
        description: "Saving session data to the database...",
      });
      
      const success = await storeSessionTranscript(session.id);
      
      if (success) {
        toast({
          title: "Success",
          description: "Transcript has been stored in the database and will now be recognized in user journeys",
        });
      }
    } catch (error) {
      console.error("Error storing transcript:", error);
      toast({
        title: "Error",
        description: "Failed to store transcript",
        variant: "destructive"
      });
    } finally {
      setIsStoring(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white via-brand-tertiary/5 to-brand-secondary/5 rounded-xl border-2 border-brand-primary/20 shadow-elegant p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <SessionHeader session={session} hasTranscript={hasTranscript} />
        </div>
        
        <Button 
          variant="brand"
          className="gap-2 shadow-elegant"
          onClick={handleStoreTranscript}
          disabled={isStoring}
        >
          <Database className="h-4 w-4" />
          <span className="font-bold">{isStoring ? "Storing..." : "Store Transcript"}</span>
        </Button>
      </div>
      
      {isReflectionSession && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl text-sm">
          <p className="font-bold text-amber-800 dark:text-amber-200">
            This appears to be a reflection session. Reflection sessions are now automatically stored in the database when loaded.
          </p>
        </div>
      )}
      
      <SessionTabs session={session} hasTranscript={hasTranscript} />
    </div>
  );
};
