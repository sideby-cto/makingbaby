
import { useState, useEffect } from "react";
import { Match } from "../types/matches";
import { MatchMessage } from "../types/messages";
import { fetchMatchMessages, getAllMessagesSorted, sendMessage } from "../services/messageService";
import { supabase } from "@/integrations/supabase/client";

export const useMatchMessages = (match: Match | null) => {
  const [messages, setMessages] = useState<MatchMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);

  const fetchMessages = async (matchId: string) => {
    try {
      setLoading(true);
      const fetchedMessages = await fetchMatchMessages(matchId);
      setMessages(fetchedMessages);
    } catch (err) {
      console.error("Error in fetchMessages:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages when the match changes
  useEffect(() => {
    if (match) {
      fetchMessages(match.id);
    } else {
      setMessages([]);
    }
  }, [match]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!match) return;

    // Create a subscription for all messages
    const messagesChannel = supabase
      .channel(`match_messages_${match.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_scheduling_messages',
          filter: `match_id=eq.${match.id}`
        },
        (payload) => {
          const newMessage = payload.new as MatchMessage;
          
          // Ensure sender_type is set
          if (!newMessage.sender_type) {
            // Check if this is likely an admin message using the legacy approach
            if (
              newMessage.sender_id === '00000000-0000-0000-0000-000000000000' ||
              newMessage.sender_id === 'admin' ||
              newMessage.sender_id === 'robot@sideby' ||
              (typeof newMessage.sender_id === 'string' && newMessage.sender_id.includes('@sideby'))
            ) {
              newMessage.sender_type = 'admin';
            } else {
              newMessage.sender_type = 'user';
            }
          }
          
          setMessages(currentMessages => [...currentMessages, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [match]);

  // Send a new message
  const sendNewMessage = async (content: string) => {
    if (!match || !content.trim()) return;

    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!userData?.user?.id) throw new Error("User not authenticated");

      await sendMessage(match.id, userData.user.id, content);
      // No need to update messages here as the subscription will handle it
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err);
    }
  };

  return {
    messages: getAllMessagesSorted(messages),
    loading,
    error,
    sendMessage: sendNewMessage,
    refreshMessages: match ? () => fetchMessages(match.id) : () => {}
  };
};
