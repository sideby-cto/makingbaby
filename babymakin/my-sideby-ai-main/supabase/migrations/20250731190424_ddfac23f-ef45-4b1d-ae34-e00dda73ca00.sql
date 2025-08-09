-- Create badge_opt_ins table for tracking user opt-ins to upcoming badges
CREATE TABLE public.badge_opt_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL,
  opted_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.badge_opt_ins ENABLE ROW LEVEL SECURITY;

-- Create policies for badge opt-ins
CREATE POLICY "Users can view their own badge opt-ins" 
ON public.badge_opt_ins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own badge opt-ins" 
ON public.badge_opt_ins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own badge opt-ins" 
ON public.badge_opt_ins 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own badge opt-ins" 
ON public.badge_opt_ins 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can manage all badge opt-ins
CREATE POLICY "Admins can manage all badge opt-ins" 
ON public.badge_opt_ins 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.email LIKE '%@sideby.ai'
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_badge_opt_ins_updated_at
BEFORE UPDATE ON public.badge_opt_ins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint to prevent duplicate opt-ins
ALTER TABLE public.badge_opt_ins 
ADD CONSTRAINT unique_user_badge_opt_in 
UNIQUE (user_id, badge_id);