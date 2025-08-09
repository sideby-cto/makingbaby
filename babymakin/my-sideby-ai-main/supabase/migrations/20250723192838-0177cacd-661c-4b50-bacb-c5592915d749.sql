-- Create table for idea massage prompts and responses
CREATE TABLE public.idea_massage_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  saved_item_id UUID REFERENCES saved_items(id) ON DELETE CASCADE NOT NULL,
  user_prompt TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  original_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.idea_massage_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for idea massage prompts
CREATE POLICY "Users can view their own massage prompts"
  ON public.idea_massage_prompts
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own massage prompts"
  ON public.idea_massage_prompts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own massage prompts"
  ON public.idea_massage_prompts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own massage prompts"
  ON public.idea_massage_prompts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_idea_massage_prompts_updated_at
  BEFORE UPDATE ON public.idea_massage_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create index for better performance
CREATE INDEX idx_idea_massage_prompts_saved_item_id ON public.idea_massage_prompts(saved_item_id);
CREATE INDEX idx_idea_massage_prompts_user_id ON public.idea_massage_prompts(user_id);
CREATE INDEX idx_idea_massage_prompts_created_at ON public.idea_massage_prompts(created_at DESC);