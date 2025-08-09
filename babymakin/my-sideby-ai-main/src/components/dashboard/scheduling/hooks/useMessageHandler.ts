
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMessageContext } from "@/contexts/MessageContext";

export const useMessageHandler = (
  matchId: string, 
  matchRationale: string | null,
  sendMessage: (content: string) => Promise<boolean>
) => {
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const mountedRef = useRef(true);
  
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  const handleSendMessage = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to send messages",
        variant: "destructive"
      });
      return;
    }
    
    if (newMessage.trim() && matchId) {
      const success = await sendMessage(newMessage.trim());
      if (success && mountedRef.current) {
        setNewMessage("");
      }
    }
  };
  
  return {
    newMessage,
    setNewMessage,
    handleSendMessage
  };
};
