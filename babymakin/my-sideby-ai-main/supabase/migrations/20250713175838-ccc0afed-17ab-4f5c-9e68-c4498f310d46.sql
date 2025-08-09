-- Add missing foreign key constraint for user_id in match_user_notes table
-- This ensures data integrity and prevents silent failures when saving notes

ALTER TABLE public.match_user_notes 
ADD CONSTRAINT match_user_notes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;