
-- Add foreign key constraint to link idea_discussion_messages.sender_id to profiles.id
ALTER TABLE public.idea_discussion_messages 
ADD CONSTRAINT fk_idea_discussion_messages_sender 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
