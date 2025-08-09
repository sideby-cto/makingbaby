
-- Fix the notification_delivery_logs check constraint that's causing signup failures
-- The current constraint is too restrictive and causing database errors during user signup

-- Drop the existing problematic check constraint
ALTER TABLE notification_delivery_logs DROP CONSTRAINT IF EXISTS notification_delivery_logs_channel_check;

-- Add a more flexible check constraint that allows the channels we actually use
ALTER TABLE notification_delivery_logs ADD CONSTRAINT notification_delivery_logs_channel_check 
CHECK (channel IN ('email', 'sms', 'in_app', 'push'));

-- Also ensure the source_table constraint is flexible enough
ALTER TABLE notification_delivery_logs DROP CONSTRAINT IF EXISTS notification_delivery_logs_source_table_check;
ALTER TABLE notification_delivery_logs ADD CONSTRAINT notification_delivery_logs_source_table_check 
CHECK (source_table IN ('notifications', 'pending_notifications', 'system'));
