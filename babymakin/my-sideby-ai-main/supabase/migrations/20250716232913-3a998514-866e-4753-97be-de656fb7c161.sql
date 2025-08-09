-- Add unique constraint to upduo_transcripts table to fix transcript storage issues
-- This prevents duplicate entries and allows the store-session-transcript function to work properly

ALTER TABLE public.upduo_transcripts 
ADD CONSTRAINT upduo_transcripts_user_conversation_unique 
UNIQUE (user_id, conversation_id);