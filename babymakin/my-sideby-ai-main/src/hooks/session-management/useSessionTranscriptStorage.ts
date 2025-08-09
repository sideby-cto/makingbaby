import { useToast } from "@/hooks/use-toast";
import { UpduoSession } from "./types";
import { supabase } from "@/integrations/supabase/client";

export function useSessionTranscriptStorage() {
  const { toast } = useToast();

  /**
   * Determines if a session should be automatically stored based on its type and content
   */
  const shouldAutoStoreSession = (session: UpduoSession): boolean => {
    // Check if this is a reflection or welcome session
    if (session.type === "SINGLE") {
      return true;
    }

    // Check for welcome/reflection in knowledge node names
    if (session.knowledgeNodes && session.knowledgeNodes.length > 0) {
      for (const node of session.knowledgeNodes) {
        const nodeName = node.name?.toLowerCase() || "";
        if (
          nodeName.includes("welcome to sideby") ||
          nodeName.includes("reflection") ||
          nodeName.includes("welcome session")
        ) {
          return true;
        }
      }
    }

    // If we have transcript contents
    if (session.transcriptContents && session.transcriptContents.length > 0) {
      return true;
    }

    return false;
  };

  /**
   * Stores a session transcript in the database
   */
  const storeSessionTranscript = async (
    sessionId: string,
    sessions: UpduoSession[]
  ): Promise<boolean> => {
    try {
      // Find the session in the cached data
      const session = sessions.find((s) => s.id === sessionId);

      if (!session) {
        console.error(`Session not found in local cache: ${sessionId}`);
        toast({
          title: "Session not found",
          description: "Could not find the session in the cached data.",
          variant: "destructive",
        });
        return false;
      }

      // First, associate users with Sideby members
      console.log('Starting user association for session:', sessionId);
      const { data: associationData, error: associationError } = await supabase.functions.invoke('associate-upduo-users', {
        body: {
          sessionId: session.id,
          upduoUsers: session.users.map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
          }))
        }
      });

      if (associationError) {
        console.error('Error associating users:', associationError);
        // Continue with storage even if association fails
      } else {
        console.log('User association completed:', associationData?.summary);
      }

      // Call store-session-transcript with force=true to update existing transcripts
      const { data, error } = await supabase.functions.invoke(
        "store-session-transcript",
        {
          body: { session, force: true }, // Force update if exists
        }
      );

      if (error) {
        console.error("Edge function error:", error);
        toast({
          title: "Error storing transcript",
          description: error.message || "An unknown error occurred.",
          variant: "destructive",
        });
        return false;
      }

      if (!data.success) {
        console.error("Failed to store transcript:", data.error, data);
        toast({
          title: "Partial success",
          description: data.error || "Some users couldn't be processed.",
          variant: "default",
        });
        return data.results?.some((r) => r.success) || false;
      }

      console.log("Transcript stored successfully:", data);
      toast({
        title: "Success",
        description: "The session transcript was stored successfully.",
      });
      return true;
    } catch (error) {
      console.error("Error storing session transcript:", error);
      toast({
        title: "Error storing transcript",
        description:
          "Failed to store the session transcript. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      // Send fallback notification for manual transcript storage
      if (sessions.length > 0) {
        try {
          const { sendFallbackNotification } = await import('@/services/webhookMonitoring');
          const session = sessions.find(s => s.id === sessionId);
          if (session) {
            await sendFallbackNotification(session, []);
            console.log('Fallback notification sent for manual transcript storage');
          }
        } catch (notificationError) {
          console.error('Error sending fallback notification:', notificationError);
          // Don't show this error to user since main operation might have succeeded
        }
      }
    }
  };

  /**
   * Internal function to store session transcript automatically
   */
  const storeSessionTranscriptInternal = async (
    session: UpduoSession
  ): Promise<boolean> => {
    try {
      console.log(`Storing transcript for session: ${session.id}`, {
        sessionType: session.type,
        hasTranscript:
          session.transcriptContents && session.transcriptContents.length > 0,
      });

      // Call the store-session-transcript edge function
      const result = await supabase.functions.invoke(
        "store-session-transcript",
        {
          body: { session, force: false }, // Changed to not force overwrite by default
        }
      );

      const { data, error } = result;

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      if (!data.success) {
        console.error("Failed to store transcript:", result);
        throw new Error(data.error || "Failed to store transcript");
      }

      console.log("Transcript stored successfully:", data);
      return true;
    } catch (error) {
      console.error("Error storing session transcript:", error);
      return false;
    }
  };

  return {
    shouldAutoStoreSession,
    storeSessionTranscript,
    storeSessionTranscriptInternal,
  };
}
