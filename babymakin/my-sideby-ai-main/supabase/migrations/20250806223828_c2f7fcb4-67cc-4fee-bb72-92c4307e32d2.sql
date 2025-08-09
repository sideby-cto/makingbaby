-- Test the email notification system by creating a new idea
INSERT INTO public.saved_items (
  user_id,
  type,
  content,
  excitement_level,
  alignment_level
) VALUES (
  'f03dfc4e-d4f3-4a35-b59c-ae4751dafc66',
  'idea',
  'Test idea to validate email notifications: This is a test idea to ensure that our email notification system is working correctly after fixing the column name mismatch and email sending logic.',
  5,
  5
);