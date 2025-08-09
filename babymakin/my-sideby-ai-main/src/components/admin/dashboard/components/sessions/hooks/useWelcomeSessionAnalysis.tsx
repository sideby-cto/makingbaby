
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UpduoSession } from "@/hooks/useUpduoSessions";
import { supabase } from "@/integrations/supabase/client";
import { useHatManagement } from "@/hooks/useHatManagement";

export const useWelcomeSessionAnalysis = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();
  const { updateHatMetadata } = useHatManagement();

  const analyzeWelcomeSession = async (session: UpduoSession, userId: string): Promise<boolean> => {
    if (!isWelcomeSession(session) || !session.transcriptContents) {
      return false;
    }

    try {
      setAnalyzing(true);
      toast({
        title: "Analyzing Session",
        description: "Extracting flow activity from welcome session...",
      });

      // Get sideby user ID if available through mappings
      let targetUserId = userId;
      
      // Check if the user needs mapping (when it's not a UUID format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        const user = session.users.find(u => u.id === userId);
        if (!user) {
          throw new Error('User not found in session');
        }

        console.log(`Looking up mapping for Upduo user: ${userId} (${user.firstName} ${user.lastName || ''})`);
        
        const { data: mappingData, error: mappingError } = await supabase.functions.invoke<{ userId: string; success: boolean }>('upduo-user-lookup', {
          body: { 
            upduoUserId: userId,
            upduoUserName: `${user.firstName} ${user.lastName || ''}`,
          }
        });
        
        if (mappingError) {
          console.error('Error looking up user mapping:', mappingError);
          toast({
            title: "User Mapping Failed",
            description: "Could not map Upduo user to sideby user. Will try to continue with the Upduo ID.",
            variant: "destructive",
          });
          // Do not return false here - let's try to use the Upduo ID directly
        } else if (mappingData?.success && mappingData?.userId) {
          targetUserId = mappingData.userId;
          console.log(`Successfully mapped Upduo user ${userId} to sideby user ${targetUserId}`);
        } else {
          console.log(`No explicit mapping found for Upduo user ${userId}, will use original ID`);
          toast({
            title: "User Not Found",
            description: "Using Upduo ID directly as fallback.",
            variant: "default",
          });
          // Continue with original ID as a fallback
        }
      }
      
      console.log(`Calling extract-flow-activity with user ID: ${targetUserId}`);
      const { data, error } = await supabase.functions.invoke('extract-flow-activity', {
        body: { 
          userId: targetUserId,
          transcript: session.transcriptContents,
          sessionTitle: session.knowledgeNodes?.[0]?.name || 'Welcome Session'
        }
      });

      if (error) {
        console.error('Error analyzing flow activity:', error);
        throw error;
      }
      
      if (data.success) {
        if (data.flowActivity && data.flowActivity !== 'unknown') {
          // Update profiles table with primary_flow_activity directly
          if (data.isNewActivity) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ primary_flow_activity: data.flowActivity })
              .eq('id', targetUserId);
              
            if (updateError) {
              console.error('Error updating primary flow activity:', updateError);
            }
            
            // Also store hat metadata for this detected hat
            await updateHatMetadata(targetUserId, data.flowActivity, 'ai_inferred', session.id);
          }
          
          toast({
            title: "Flow Activity Detected",
            description: `Flow activity: ${data.flowActivity}`,
            duration: 5000,
          });
        } else {
          toast({
            title: "Analysis Complete",
            description: "Could not determine flow activity with high confidence",
            variant: "default",
          });
        }
        return true;
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing flow activity:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not analyze flow activity from transcript",
        variant: "destructive",
        duration: 5000,
      });
      return false;
    } finally {
      setAnalyzing(false);
    }
  };

  const isWelcomeSession = (session: UpduoSession): boolean => {
    return session.knowledgeNodes?.some(node => 
      node.name?.toLowerCase().includes('welcome to sideby')
    ) || false;
  };

  return {
    analyzeWelcomeSession,
    isWelcomeSession,
    analyzing
  };
};
