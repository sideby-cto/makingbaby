-- Create match_user_notes table
CREATE TABLE public.match_user_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add foreign key constraint to matches table
ALTER TABLE public.match_user_notes 
ADD CONSTRAINT match_user_notes_match_id_fkey 
FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_match_user_notes_match_id ON public.match_user_notes(match_id);
CREATE INDEX idx_match_user_notes_user_id ON public.match_user_notes(user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_match_user_notes_updated_at
BEFORE UPDATE ON public.match_user_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();