
-- First, let's ensure we have a proper tools table with all the fields we need
CREATE TABLE IF NOT EXISTS public.tools (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('chatgpt_plus', 'lovable_dev', 'descript', 'upduo', 'custom')),
  description text,
  url text NOT NULL,
  price_per_month numeric,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
  category text,
  icon_url text,
  tags text[],
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Ensure user_tools table exists with proper structure
CREATE TABLE IF NOT EXISTS public.user_tools (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  access_metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Create tool categories table for better organization
CREATE TABLE IF NOT EXISTS public.tool_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  display_order integer DEFAULT 0,
  color text,
  icon_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create tool favorites table
CREATE TABLE IF NOT EXISTS public.tool_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Insert default tool categories
INSERT INTO public.tool_categories (name, description, display_order, color, icon_name) VALUES
('AI Assistants', 'Conversational AI tools for various tasks', 1, '#10B981', 'MessageSquare'),
('Content Creation', 'Tools for creating and editing content', 2, '#8B5CF6', 'PenTool'),
('Development', 'Tools for building and coding applications', 3, '#F59E0B', 'Code'),
('Education', 'Tools specifically designed for educational purposes', 4, '#EF4444', 'GraduationCap'),
('Custom Tools', 'User-added custom tools and integrations', 5, '#6B7280', 'Settings')
ON CONFLICT (name) DO NOTHING;

-- Insert/update the predefined tools with proper categories
INSERT INTO public.tools (id, name, type, description, url, price_per_month, status, category) VALUES
('chatgpt-plus-id', 'ChatGPT Plus', 'chatgpt_plus', 'Access GPT-4 and advanced AI features for enhanced conversational AI capabilities', 'https://chat.openai.com/', 20, 'active', 'AI Assistants'),
('descript-id', 'Descript', 'descript', 'All-in-one video and audio editing platform with AI-powered transcription and editing tools', 'https://www.descript.com/', 15, 'active', 'Content Creation'),
('lovable-id', 'Lovable.dev', 'lovable_dev', 'AI-powered web app development platform for building beautiful applications quickly', 'https://lovable.dev', 29, 'active', 'Development'),
('upduo-id', 'Upduo', 'upduo', 'AI-powered speaking practice platform for language learning. Use community code: washington', 'https://web.upduo.com/splash', 0, 'active', 'Education')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  price_per_month = EXCLUDED.price_per_month,
  category = EXCLUDED.category,
  updated_at = now();

-- Enable RLS on all tables
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for tools (public read, admin write)
DROP POLICY IF EXISTS "Tools are viewable by everyone" ON public.tools;
CREATE POLICY "Tools are viewable by everyone" ON public.tools
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage tools" ON public.tools;
CREATE POLICY "Admins can manage tools" ON public.tools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
    )
  );

-- RLS policies for user_tools
DROP POLICY IF EXISTS "Users can view their own tools" ON public.user_tools;
CREATE POLICY "Users can view their own tools" ON public.user_tools
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage user tools" ON public.user_tools;
CREATE POLICY "Admins can manage user tools" ON public.user_tools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
    )
  );

-- RLS policies for tool_categories (public read, admin write)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.tool_categories;
CREATE POLICY "Categories are viewable by everyone" ON public.tool_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.tool_categories;
CREATE POLICY "Admins can manage categories" ON public.tool_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
    )
  );

-- RLS policies for tool_favorites
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.tool_favorites;
CREATE POLICY "Users can manage their own favorites" ON public.tool_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_tools_user_id ON public.user_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tools_tool_id ON public.user_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_status ON public.tools(status);
CREATE INDEX IF NOT EXISTS idx_tool_favorites_user_id ON public.tool_favorites(user_id);

-- Create trigger to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tools_updated_at ON public.tools;
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_tools_updated_at ON public.user_tools;
CREATE TRIGGER update_user_tools_updated_at BEFORE UPDATE ON public.user_tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tool_categories_updated_at ON public.tool_categories;
CREATE TRIGGER update_tool_categories_updated_at BEFORE UPDATE ON public.tool_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
