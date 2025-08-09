-- Create the upduo_user_mappings table for reliable user association
CREATE TABLE public.upduo_user_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sideby_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  upduo_user_id TEXT NOT NULL,
  upduo_first_name TEXT,
  upduo_last_name TEXT,
  confidence_score NUMERIC(3,2) DEFAULT 1.0,
  mapping_method TEXT NOT NULL DEFAULT 'manual',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(sideby_user_id, upduo_user_id),
  UNIQUE(upduo_user_id)
);

-- Enable RLS
ALTER TABLE public.upduo_user_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin users can manage all mappings" 
ON public.upduo_user_mappings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND email LIKE '%@sideby.ai'
  )
);

CREATE POLICY "Users can view their own mappings" 
ON public.upduo_user_mappings 
FOR SELECT 
USING (auth.uid() = sideby_user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_upduo_user_mappings_updated_at
  BEFORE UPDATE ON public.upduo_user_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_upduo_user_mappings_sideby_user_id ON public.upduo_user_mappings(sideby_user_id);
CREATE INDEX idx_upduo_user_mappings_upduo_user_id ON public.upduo_user_mappings(upduo_user_id);
CREATE INDEX idx_upduo_user_mappings_verified ON public.upduo_user_mappings(verified);

-- Add session association tracking table
CREATE TABLE public.upduo_session_associations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  sideby_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  upduo_user_id TEXT NOT NULL,
  association_method TEXT NOT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 1.0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  mapping_id UUID REFERENCES public.upduo_user_mappings(id),
  UNIQUE(session_id, sideby_user_id)
);

-- Enable RLS for session associations
ALTER TABLE public.upduo_session_associations ENABLE ROW LEVEL SECURITY;

-- Create policies for session associations
CREATE POLICY "Admin users can manage all session associations" 
ON public.upduo_session_associations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND email LIKE '%@sideby.ai'
  )
);

CREATE POLICY "Users can view their own session associations" 
ON public.upduo_session_associations 
FOR SELECT 
USING (auth.uid() = sideby_user_id);

-- Create indexes for session associations
CREATE INDEX idx_upduo_session_associations_session_id ON public.upduo_session_associations(session_id);
CREATE INDEX idx_upduo_session_associations_sideby_user_id ON public.upduo_session_associations(sideby_user_id);
CREATE INDEX idx_upduo_session_associations_mapping_id ON public.upduo_session_associations(mapping_id);