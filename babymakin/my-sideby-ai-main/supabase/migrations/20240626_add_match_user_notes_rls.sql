
-- Enable RLS on match_user_notes table
ALTER TABLE public.match_user_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notes
CREATE POLICY "Users can view their own match notes" ON public.match_user_notes
FOR SELECT USING (
  auth.uid() = user_id
);

-- Policy: Users can insert their own notes
CREATE POLICY "Users can insert their own match notes" ON public.match_user_notes
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Policy: Users can update their own notes
CREATE POLICY "Users can update their own match notes" ON public.match_user_notes
FOR UPDATE USING (
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);

-- Policy: Users can delete their own notes
CREATE POLICY "Users can delete their own match notes" ON public.match_user_notes
FOR DELETE USING (
  auth.uid() = user_id
);

-- Policy: Admins can manage all notes
CREATE POLICY "Admins can manage all match notes" ON public.match_user_notes
FOR ALL USING (
  public.is_admin_user()
);
