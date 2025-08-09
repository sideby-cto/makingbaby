-- Create user_account_creation table for tracking account creation
CREATE TABLE public.user_account_creation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  creation_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_account_creation ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own account creation logs" 
ON public.user_account_creation 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own account creation logs" 
ON public.user_account_creation 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all account creation logs" 
ON public.user_account_creation 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() 
  AND email LIKE '%@sideby.ai'
));

-- Add trigger for updated_at
CREATE TRIGGER update_user_account_creation_updated_at
  BEFORE UPDATE ON public.user_account_creation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();