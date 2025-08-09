
-- Temporarily disable RLS on email-related tables
-- This is a temporary fix while we resolve the RLS policy issues

-- Disable RLS on email_templates table
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;

-- Disable RLS on email_accounts table  
ALTER TABLE email_accounts DISABLE ROW LEVEL SECURITY;

-- Disable RLS on email_send_logs table
ALTER TABLE email_send_logs DISABLE ROW LEVEL SECURITY;

-- Note: This is temporary - we'll re-enable RLS once the admin functionality is working
-- Run this in your Supabase SQL editor to temporarily fix the permission issues
