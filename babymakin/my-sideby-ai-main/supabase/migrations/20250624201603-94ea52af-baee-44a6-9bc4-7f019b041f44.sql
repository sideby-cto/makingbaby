
-- Remove the beta_user_pending_emails table and related functions
DROP TABLE IF EXISTS public.beta_user_pending_emails CASCADE;

-- Remove the auto_enroll_beta_users function and trigger
DROP FUNCTION IF EXISTS public.auto_enroll_beta_users() CASCADE;

-- Remove any RPC functions related to pending emails
DROP FUNCTION IF EXISTS public.admin_pre_enroll_beta_user(text) CASCADE;
DROP FUNCTION IF EXISTS public.admin_remove_pending_beta_email(text) CASCADE;
