
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MatchMessage, PartnerInfo } from "../types";
import { useToast } from "@/hooks/use-toast";

interface UseMessageSenderProps {
  matchId: string;
  userId?: string;
  partnerInfo: PartnerInfo | null;
  addMessage: (message: MatchMessage) => void;
  updateContextMessages: (messages: MatchMessage[] | MatchMessage) => void;
}

export const useMessageSender = ({
  matchId,
  userId = '',
  partnerInfo,
  addMessage,
  updateContextMessages
}: UseMessageSenderProps) => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim() || !matchId || !userId) {
      return false;
    }
    
    setIsSending(true);
    
    try {
      // Format message for database
      const messageData = {
        match_id: matchId,
        sender_id: userId,
        content: content.trim(),
        sender_type: 'user'
      };
      
      // Send to database
      const { data, error } = await supabase
        .from('match_scheduling_messages')
        .insert([messageData])
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        console.log("Message sent successfully:", data);
        
        // Optimistically add to local messages
        const formattedMessage: MatchMessage = {
          id: data.id,
          match_id: data.match_id,
          sender_id: data.sender_id,
          content: data.content,
          created_at: data.created_at,
          updated_at: data.updated_at,
          sender_type: 'user',
          timezone: data.timezone || null, // Add timezone
          isCurrentUser: true,
          senderName: 'You'
        };
        
        // Add to local state
        addMessage(formattedMessage);
        
        // Add to global context
        updateContextMessages(formattedMessage);
      }
      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      toast({
        title: "Error sending message",
        description: "Please try again later",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSending(false);
    }
  }, [matchId, userId, partnerInfo, addMessage, updateContextMessages, toast]);

  return {
    sendMessage,
    isSending
  };
};
