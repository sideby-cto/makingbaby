
-- Fix Erica's profile status to make her matches visible
UPDATE profiles 
SET status = 'active' 
WHERE email = 'erica@sideby.ai';
