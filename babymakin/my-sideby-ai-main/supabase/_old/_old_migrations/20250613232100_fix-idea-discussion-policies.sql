
-- Fix RLS policies for idea_discussion_messages table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages for their own ideas" ON public.idea_discussion_messages;
DROP POLICY IF EXISTS "Users can create messages for their own ideas" ON public.idea_discussion_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.idea_discussion_messages;
DROP POLICY IF EXISTS "Admins can create messages on any idea" ON public.idea_discussion_messages;

-- Create improved policies with better error handling
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
