
-- Step 1: Clear the migration history in production
-- This removes all records from the schema_migrations table
DELETE FROM supabase_migrations.schema_migrations;

-- Step 2: Create a fresh initial migration that captures the current database state
-- Insert a record for our new initial migration
INSERT INTO supabase_migrations.schema_migrations (version, statements, name) 
VALUES (
  '20250624191206', 
  ARRAY['-- Initial migration to capture current database schema'],
  'initial_migration'
);
