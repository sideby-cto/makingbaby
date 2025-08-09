
-- Update admin_user_availability_view to use profiles table instead of auth.users
CREATE OR REPLACE VIEW public.admin_user_availability_view AS
SELECT 
  ua.id,
  ua.user_id,
  p.first_name,
  p.last_name,
  p.email,
  ua.pacing_level,
  ua.time_slots,
  ua.created_at,
  ua.updated_at
FROM user_availability ua
JOIN profiles p ON ua.user_id = p.id
WHERE p.email LIKE '%@sideby.ai'
ORDER BY p.first_name, p.last_name;
