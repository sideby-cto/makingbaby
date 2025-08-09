
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendAdminMessage, sendIntroductionEmail } from "../services/matchActionsService";
import type { Match } from "../types/matches";
import { supabase } from "@/integrations/supabase/client";

export const useMatchActions = () => {
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleMessageChange = (matchId: string, message: string) => {
    setNewMessage(prev => ({ ...prev, [matchId]: message }));
  };

  const handleSendMessage = async (matchId: string) => {
    if (!newMessage[matchId]?.trim()) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) throw new Error("User not authenticated");
      
      await sendAdminMessage(matchId, userData.user.id, newMessage[matchId]);
      
      setNewMessage(prev => ({ ...prev, [matchId]: '' }));

      toast({
        title: "Message sent",
        description: "Your message has been sent to both participants.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShipIt = async (match: Match) => {
    try {
      setSendingEmail(match.id);
      
      toast({
        title: "Sending email...",
        description: `Introduction email will be sent to ${match.user1.first_name}`,
      });

      setTimeout(async () => {
        const result = await sendIntroductionEmail(match);
          
        if (!result.success) {
          toast({
            title: "Email not sent",
            description: "There was a problem sending the introduction email. Please check your Resend API key and try again.",
            variant: "destructive",
          });
        }
      }, 3000);

    } catch (error) {
      console.error('Error queueing match email:', error);
      toast({
        title: "Error sending email",
        description: "There was a problem sending the introduction email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(null);
    }
  };

  return {
    newMessage,
    sendingEmail,
    handleMessageChange,
    handleSendMessage,
    handleShipIt
  };
};
