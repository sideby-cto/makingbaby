
-- Create the idea_discussion_messages table for structured discussions
CREATE TABLE public.idea_discussion_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.saved_items(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'user' CHECK (sender_type IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.idea_discussion_messages ENABLE ROW LEVEL SECURITY;

-- Policy for users to view messages for their own ideas
CREATE POLICY "Users can view messages for their own ideas"
  ON public.idea_discussion_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_items 
      WHERE id = idea_discussion_messages.idea_id 
      AND user_id = auth.uid()
    )
  );

-- Policy for users to create messages for their own ideas
CREATE POLICY "Users can create messages for their own ideas"
  ON public.idea_discussion_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.saved_items 
      WHERE id = idea_discussion_messages.idea_id 
      AND user_id = auth.uid()
    )
    AND sender_id = auth.uid()
    AND sender_type = 'user'
  );

-- Policy for admins to view all messages
CREATE POLICY "Admins can view all messages"
  ON public.idea_discussion_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND email LIKE '%@sideby.ai'
    )
  );

-- Policy for admins to create messages on any idea
CREATE POLICY "Admins can create messages on any idea"
  ON public.idea_discussion_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND email LIKE '%@sideby.ai'
    )
    AND sender_type = 'admin'
  );

-- Create index for better performance
CREATE INDEX idx_idea_discussion_messages_idea_id ON public.idea_discussion_messages(idea_id);
CREATE INDEX idx_idea_discussion_messages_created_at ON public.idea_discussion_messages(created_at);

-- Enable realtime for the new table
ALTER TABLE public.idea_discussion_messages REPLICA IDENTITY FULL;
