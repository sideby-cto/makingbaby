-- Add missing foreign key constraint for user_id in match_user_notes table
-- This ensures data integrity and prevents silent failures when saving notes

ALTER TABLE public.match_user_notes 
ADD CONSTRAINT match_user_notes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add RLS policies to ensure proper access control
-- Users can only access their own notes for matches they're part of
CREATE POLICY "Users can view their own match notes" 
ON public.match_user_notes 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE m.id = match_id 
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can create their own match notes" 
ON public.match_user_notes 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE m.id = match_id 
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own match notes" 
ON public.match_user_notes 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE m.id = match_id 
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can delete their own match notes" 
ON public.match_user_notes 
FOR DELETE 
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE m.id = match_id 
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

-- Enable RLS on the table
ALTER TABLE public.match_user_notes ENABLE ROW LEVEL SECURITY;