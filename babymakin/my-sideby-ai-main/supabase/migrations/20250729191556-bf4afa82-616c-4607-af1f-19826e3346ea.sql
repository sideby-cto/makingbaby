-- Fix user_custom_tools RLS policy by adding WITH CHECK constraint
DROP POLICY IF EXISTS "Users can create custom tools" ON user_custom_tools;

CREATE POLICY "Users can create custom tools" ON user_custom_tools
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Check if we need to add INSERT/UPDATE policies for journey_stage_config
-- This table appears to be admin-controlled, so let's add policies for regular users to read
-- and admins to manage
DROP POLICY IF EXISTS "Users can view journey stage config" ON journey_stage_config;
DROP POLICY IF EXISTS "Admins can manage journey stage config" ON journey_stage_config;

CREATE POLICY "Users can view journey stage config" ON journey_stage_config
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage journey stage config" ON journey_stage_config
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND email LIKE '%@sideby.ai'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND email LIKE '%@sideby.ai'
  )
);