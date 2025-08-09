
// Replacement hook for backward compatibility after idea discussions removal
export interface IdeaDiscussionMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender_type: string;
  profiles?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export const useIdeaDiscussions = (ideaId: string) => {
  return {
    messages: [] as IdeaDiscussionMessage[],
    isLoading: false,
    isSubmitting: false,
    addMessage: async (content: string) => {
      console.log("IdeaDiscussions functionality has been removed");
      return Promise.resolve(false);
    }
  };
};
