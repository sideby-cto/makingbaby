-- Update the check constraint on user_custom_tools to allow 'scheduler' type
ALTER TABLE user_custom_tools DROP CONSTRAINT IF EXISTS user_custom_tools_type_check;
ALTER TABLE user_custom_tools ADD CONSTRAINT user_custom_tools_type_check CHECK (type IN ('predefined', 'custom', 'scheduler'));