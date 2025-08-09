-- Rename reflection_time column to reflection_start
ALTER TABLE public.user_reflections 
RENAME COLUMN reflection_time TO reflection_start;