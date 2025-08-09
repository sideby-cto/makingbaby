-- Phase 1: Fix Critical Database Issues
-- Add INSERT policies for signup_transaction_logs to allow proper logging

-- First, let's check if the table exists and add missing policies
DO $$
BEGIN
  -- Check if signup_transaction_logs table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'signup_transaction_logs') THEN
    
    -- Add INSERT policy for signup transaction logs
    -- Users can insert their own transaction logs
    DROP POLICY IF EXISTS "Users can insert their own signup logs" ON public.signup_transaction_logs;
    CREATE POLICY "Users can insert their own signup logs" 
    ON public.signup_transaction_logs 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

    -- Add SELECT policy for admins to view logs
    DROP POLICY IF EXISTS "Admins can view all signup logs" ON public.signup_transaction_logs;
    CREATE POLICY "Admins can view all signup logs" 
    ON public.signup_transaction_logs 
    FOR SELECT 
    USING (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND email LIKE '%@sideby.ai'
    ));

    -- Add UPDATE policy for system to update logs
    DROP POLICY IF EXISTS "System can update signup logs" ON public.signup_transaction_logs;
    CREATE POLICY "System can update signup logs" 
    ON public.signup_transaction_logs 
    FOR UPDATE 
    USING (auth.uid() = user_id);

    RAISE NOTICE 'Added RLS policies for signup_transaction_logs table';
  
  ELSE
    RAISE NOTICE 'signup_transaction_logs table does not exist, skipping policy creation';
  END IF;
END
$$;