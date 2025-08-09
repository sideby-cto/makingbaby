
-- Add metadata column to crews table for storing Upduo tags and other configuration
ALTER TABLE crews ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Add index for better performance when querying metadata
CREATE INDEX IF NOT EXISTS idx_crews_metadata ON crews USING gin (metadata);
