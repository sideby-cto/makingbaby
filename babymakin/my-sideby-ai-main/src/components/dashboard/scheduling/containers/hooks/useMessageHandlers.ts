
import { useToast } from "@/hooks/use-toast";

interface UseMessageHandlersProps {
  newMessage: string;
  setNewMessage: (value: string) => void;
  sendMessage: (message: string) => Promise<boolean>;
}

export const useMessageHandlers = ({ newMessage, setNewMessage, sendMessage }: UseMessageHandlersProps) => {
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const success = await sendMessage(newMessage);
      if (success) {
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if ((event.key === "Enter" && (event.metaKey || event.ctrlKey))) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return {
    handleSendMessage,
    handleKeyPress
  };
};
