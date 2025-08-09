-- Add metadata column to user_custom_tools table to store category and type information
ALTER TABLE user_custom_tools 
ADD COLUMN metadata JSONB DEFAULT '{}';

-- Add an index for better performance when querying by metadata
CREATE INDEX idx_user_custom_tools_metadata ON user_custom_tools USING GIN(metadata);