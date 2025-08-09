
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const sendMessage = async (
  matchId: string,
  userId: string,
  content: string,
  toast: ReturnType<typeof useToast>
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("match_scheduling_messages")
      .insert({
        match_id: matchId,
        sender_id: userId,
        content,
        sender_type: 'user' // Explicitly set sender_type for clarity
      })
      .select();

    if (error) {
      throw error;
    }

    console.log("Message sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    toast.toast({
      title: "Error sending message",
      description: "Please try again later",
      variant: "destructive"
    });
    return false;
  }
};
