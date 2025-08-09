-- Add is_lead column to crew_members table
ALTER TABLE public.crew_members
ADD COLUMN IF NOT EXISTS is_lead boolean NOT NULL DEFAULT false;
