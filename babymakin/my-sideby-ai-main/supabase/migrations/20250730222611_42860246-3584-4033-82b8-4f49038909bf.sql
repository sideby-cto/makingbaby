-- Remove Upduo tool from the database
UPDATE tools SET status = 'inactive' WHERE type = 'upduo';

-- Update ChatGPT Plus name to just ChatGPT
UPDATE tools SET name = 'ChatGPT' WHERE type = 'chatgpt_plus';