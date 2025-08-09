
-- Update the INSERT policy for idea_comments to properly check user authentication
DROP POLICY IF EXISTS "Users can create idea comments" ON public.idea_comments;

CREATE POLICY "Users can create idea comments" 
  ON public.idea_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
