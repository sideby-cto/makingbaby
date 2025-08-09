-- Add RLS policy to allow authenticated users to view basic profile information for association purposes
CREATE POLICY "Authenticated users can view profiles for associations"
ON public.profiles
FOR SELECT
USING (
  auth.role() = 'authenticated'
);