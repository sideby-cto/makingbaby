
-- Remove the saved_items ecosystem to simplify user deletion cascades
-- This removes functionality that's not currently being used

-- Drop dependent tables first (in reverse dependency order)
DROP TABLE IF EXISTS public.idea_discussion_messages CASCADE;
DROP TABLE IF EXISTS public.idea_comments CASCADE;
DROP TABLE IF EXISTS public.saved_items CASCADE;
