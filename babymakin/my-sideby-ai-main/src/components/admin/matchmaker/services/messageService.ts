
import { supabase } from "@/integrations/supabase/client";
import { MatchMessage } from "../types/messages";

// Define the raw database message type
interface RawMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  sender_type?: 'user' | 'admin';
}

// Fetch messages for a specific match
export const fetchMatchMessages = async (matchId: string): Promise<MatchMessage[]> => {
  console.log("Fetching messages for match ID:", matchId);

  const { data: messages, error } = await supabase
    .from('match_scheduling_messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching match messages:", error);
    throw error;
  }

  console.log("Fetched messages:", messages?.length || 0);
  
  // Map raw messages to MatchMessage type with sender_type
  const formattedMessages = messages?.map(msg => ({
    ...msg,
    sender_type: msg.sender_type || 'user' // Default to 'user' if sender_type is not set
  } as MatchMessage)) || [];
  
  return getAllMessagesSorted(formattedMessages);
};

// Get all messages sorted by creation time
export const getAllMessagesSorted = (messages: MatchMessage[]): MatchMessage[] => {
  return [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
};

// Send a new message
export const sendMessage = async (matchId: string, senderId: string, content: string): Promise<MatchMessage> => {
  if (!content.trim()) {
    throw new Error("Message content cannot be empty");
  }

  console.log("Sending user message:", { matchId, senderId, content });
  
  const messageData = {
    match_id: matchId,
    sender_id: senderId,
    content: content.trim(),
    sender_type: 'user' // Explicitly set sender_type for clarity
  };
  
  const { data, error } = await supabase
    .from('match_scheduling_messages')
    .insert([messageData])
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }

  console.log("User message sent successfully:", data);

  return data as MatchMessage;
};

// Send an admin message (visible to both users)
export const sendAdminMessage = async (matchId: string, senderId: string, content: string): Promise<MatchMessage> => {
  if (!content.trim()) {
    throw new Error("Message content cannot be empty");
  }
  
  console.log("Sending admin message:", { matchId, senderId, content });
  
  // Use UUID for sender_id and explicitly set sender_type to 'admin'
  const messageData = {
    match_id: matchId,
    sender_id: senderId, // Use the admin's actual UUID
    content: content.trim(),
    sender_type: 'admin' // Explicitly set sender_type to 'admin'
  };
  
  try {
    const { data, error } = await supabase
      .from('match_scheduling_messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error("Error sending admin message:", error);
      throw error;
    }

    console.log("Admin message sent successfully:", data);
    
    return {
      ...data,
      sender_type: 'admin'
    } as MatchMessage;
  } catch (error) {
    console.error("Exception in sendAdminMessage:", error);
    throw error;
  }
};
