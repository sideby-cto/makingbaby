
-- Enable RLS on saved_items table if not already enabled
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own saved items" ON public.saved_items;
DROP POLICY IF EXISTS "Users can create their own saved items" ON public.saved_items;
DROP POLICY IF EXISTS "Users can update their own saved items" ON public.saved_items;
DROP POLICY IF EXISTS "Users can delete their own saved items" ON public.saved_items;

-- Create comprehensive RLS policies for saved_items that support admin impersonation
CREATE POLICY "Users can view their own saved items or admins can view all" 
  ON public.saved_items 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    public.is_sideby_admin(auth.uid())
  );

CREATE POLICY "Users can create their own saved items or admins can create for any user" 
  ON public.saved_items 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    public.is_sideby_admin(auth.uid())
  );

CREATE POLICY "Users can update their own saved items or admins can update any" 
  ON public.saved_items 
  FOR UPDATE 
  USING (
    auth.uid() = user_id OR 
    public.is_sideby_admin(auth.uid())
  );

CREATE POLICY "Users can delete their own saved items or admins can delete any" 
  ON public.saved_items 
  FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    public.is_sideby_admin(auth.uid())
  );
