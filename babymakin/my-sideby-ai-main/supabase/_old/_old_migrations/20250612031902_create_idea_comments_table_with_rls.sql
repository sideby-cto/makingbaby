
-- Create idea_comments table specifically for saved items/ideas
CREATE TABLE public.idea_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id uuid NOT NULL REFERENCES public.saved_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add Row Level Security
ALTER TABLE public.idea_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for idea_comments
CREATE POLICY "Users can view idea comments" 
  ON public.idea_comments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create idea comments" 
  ON public.idea_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own idea comments" 
  ON public.idea_comments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own idea comments" 
  ON public.idea_comments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_idea_comments_idea_id ON public.idea_comments(idea_id);
CREATE INDEX idx_idea_comments_user_id ON public.idea_comments(user_id);
CREATE INDEX idx_idea_comments_created_at ON public.idea_comments(created_at);
