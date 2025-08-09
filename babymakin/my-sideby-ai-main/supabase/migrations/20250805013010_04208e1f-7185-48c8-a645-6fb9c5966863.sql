-- Add foreign key constraints to badge_opt_ins table

-- Add foreign key constraint between badge_opt_ins.user_id and profiles.id
ALTER TABLE public.badge_opt_ins 
ADD CONSTRAINT fk_badge_opt_ins_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint between badge_opt_ins.badge_id and badges.id
ALTER TABLE public.badge_opt_ins 
ADD CONSTRAINT fk_badge_opt_ins_badge_id 
FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE;