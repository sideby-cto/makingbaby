
import { useCallback } from "react";
import { useMessageContext } from "@/contexts/MessageContext";
import { MatchMessage } from "../types";

export const useContextMessagesUpdater = () => {
  const { setMessages } = useMessageContext();

  // Update messages in the global context
  const updateContextMessages = useCallback(
    (messagesInput: MatchMessage[] | MatchMessage) => {
      setMessages((prevMessages) => {
        // Handle both single message or array of messages
        const newMessages = Array.isArray(messagesInput)
          ? messagesInput
          : [messagesInput];

        // Create a map of existing messages by ID for quick lookup
        const existingMessagesMap = new Map(
          prevMessages.map((msg) => [msg.id, msg])
        );

        // Add new messages that don't already exist
        newMessages.forEach((msg) => {
          existingMessagesMap.set(msg.id, msg);
        });

        // Convert back to array and sort by creation time
        const updatedMessages = Array.from(existingMessagesMap.values()).sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        return updatedMessages;
      });
    },
    [setMessages]
  );

  // Sync all messages to context (replacing existing ones)
  const syncMessagesToContext = useCallback(
    (messages: MatchMessage[]) => {
      setMessages(messages);
    },
    [setMessages]
  );

  return {
    updateContextMessages,
    syncMessagesToContext,
  };
};
