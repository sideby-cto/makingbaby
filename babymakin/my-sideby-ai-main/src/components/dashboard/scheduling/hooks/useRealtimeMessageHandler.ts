
import { useRef, useCallback } from "react";
import { MatchMessage, PartnerInfo } from "../types";
import { transformMessageData } from "../utils/messageTransformUtils";

interface UseRealtimeMessageHandlerProps {
  messagesRef: React.MutableRefObject<MatchMessage[]>;
  addMessage: (message: MatchMessage) => void;
  updateContextMessages: (messages: MatchMessage[] | MatchMessage) => void;
  partnerInfo: PartnerInfo | null;
}

export const useRealtimeMessageHandler = ({
  messagesRef,
  addMessage,
  updateContextMessages,
  partnerInfo
}: UseRealtimeMessageHandlerProps) => {
  const processedMessageIds = useRef(new Set<string>());

  // Handle new message from realtime subscription
  const handleNewMessage = useCallback(
    (payload: any) => {
      if (!payload || !payload.new) {
        console.log("Received invalid payload:", payload);
        return;
      }

      const messageId = payload.new.id;
      if (processedMessageIds.current.has(messageId)) {
        console.log(`Message ${messageId} already processed, skipping`);
        return;
      }

      try {
        console.log("Processing realtime message:", payload.new);
        
        // Mark as processed to avoid duplicates
        processedMessageIds.current.add(messageId);
        
        // Check if we already have this message in our local state
        const existingMessage = messagesRef.current.find(
          (msg) => msg.id === messageId
        );
        
        if (!existingMessage) {
          console.log(`Adding new message ${messageId} to local state`);
          
          // Transform the message using our utility
          const transformedMessage = transformMessageData(
            payload.new,
            payload.new.sender_id, // Use sender_id from the message
            partnerInfo
          );
          
          // Add to local state
          addMessage(transformedMessage);
          
          // Add to global context
          updateContextMessages(transformedMessage);
          
          console.log(`Successfully added message ${messageId} to state`);
        } else {
          console.log(`Message ${messageId} already exists in local state`);
        }
      } catch (error) {
        console.error("Error handling realtime message:", error);
        // Remove from processed set if there was an error
        processedMessageIds.current.delete(messageId);
      }
    },
    [addMessage, updateContextMessages, partnerInfo, messagesRef]
  );

  return { handleNewMessage };
};
