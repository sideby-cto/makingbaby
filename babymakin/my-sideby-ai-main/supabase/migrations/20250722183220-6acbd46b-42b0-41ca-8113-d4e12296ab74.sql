
-- Create table for custom tools
CREATE TABLE public.custom_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category TEXT,
  icon_name TEXT,
  color TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for custom tools
ALTER TABLE public.custom_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active custom tools"
  ON public.custom_tools
  FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Users can create custom tools"
  ON public.custom_tools
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own custom tools"
  ON public.custom_tools
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Create table for tool recommendations
CREATE TABLE public.tool_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES public.tools(id) NOT NULL,
  recommended_by UUID REFERENCES auth.users(id) NOT NULL,
  recommended_to UUID REFERENCES auth.users(id) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for tool recommendations
ALTER TABLE public.tool_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recommendations for them"
  ON public.tool_recommendations
  FOR SELECT 
  USING (auth.uid() = recommended_to OR auth.uid() = recommended_by);

CREATE POLICY "Users can create recommendations"
  ON public.tool_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = recommended_by);

-- Create table for tool reviews
CREATE TABLE public.tool_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES public.tools(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(tool_id, user_id)
);

-- Add RLS policies for tool reviews
ALTER TABLE public.tool_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active reviews"
  ON public.tool_reviews
  FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Users can create reviews"
  ON public.tool_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.tool_reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_custom_tools_updated_at
  BEFORE UPDATE ON public.custom_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tool_recommendations_updated_at
  BEFORE UPDATE ON public.tool_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tool_reviews_updated_at
  BEFORE UPDATE ON public.tool_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
