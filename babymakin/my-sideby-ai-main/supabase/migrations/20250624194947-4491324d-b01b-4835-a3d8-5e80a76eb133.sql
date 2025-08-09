
-- Create table for storing touchpoint analyses
CREATE TABLE public.touchpoint_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create table for storing touchpoint chat messages
CREATE TABLE public.touchpoint_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  touchpoint_analysis_id UUID NOT NULL REFERENCES public.touchpoint_analyses(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_touchpoint_analyses_match_id ON public.touchpoint_analyses(match_id);
CREATE INDEX idx_touchpoint_analyses_status ON public.touchpoint_analyses(status);
CREATE INDEX idx_touchpoint_chat_messages_touchpoint_analysis_id ON public.touchpoint_chat_messages(touchpoint_analysis_id);
CREATE INDEX idx_touchpoint_chat_messages_created_at ON public.touchpoint_chat_messages(created_at);

-- Enable RLS
ALTER TABLE public.touchpoint_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchpoint_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for touchpoint_analyses (admin only)
CREATE POLICY "Admin users can view touchpoint analyses" 
  ON public.touchpoint_analyses 
  FOR SELECT 
  USING (public.is_sideby_admin(auth.uid()));

CREATE POLICY "Admin users can create touchpoint analyses" 
  ON public.touchpoint_analyses 
  FOR INSERT 
  WITH CHECK (public.is_sideby_admin(auth.uid()));

CREATE POLICY "Admin users can update touchpoint analyses" 
  ON public.touchpoint_analyses 
  FOR UPDATE 
  USING (public.is_sideby_admin(auth.uid()));

CREATE POLICY "Admin users can delete touchpoint analyses" 
  ON public.touchpoint_analyses 
  FOR DELETE 
  USING (public.is_sideby_admin(auth.uid()));

-- RLS policies for touchpoint_chat_messages (admin only)
CREATE POLICY "Admin users can view touchpoint chat messages" 
  ON public.touchpoint_chat_messages 
  FOR SELECT 
  USING (public.is_sideby_admin(auth.uid()));

CREATE POLICY "Admin users can create touchpoint chat messages" 
  ON public.touchpoint_chat_messages 
  FOR INSERT 
  WITH CHECK (public.is_sideby_admin(auth.uid()));

CREATE POLICY "Admin users can update touchpoint chat messages" 
  ON public.touchpoint_chat_messages 
  FOR UPDATE 
  USING (public.is_sideby_admin(auth.uid()));

CREATE POLICY "Admin users can delete touchpoint chat messages" 
  ON public.touchpoint_chat_messages 
  FOR DELETE 
  USING (public.is_sideby_admin(auth.uid()));

-- Add updated_at trigger for touchpoint_analyses
CREATE TRIGGER update_touchpoint_analyses_updated_at
  BEFORE UPDATE ON public.touchpoint_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
