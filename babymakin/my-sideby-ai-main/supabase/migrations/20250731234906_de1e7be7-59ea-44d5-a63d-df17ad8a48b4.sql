-- Create webhook_events table for monitoring webhook health and events
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_type TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  processing_time INTEGER,
  user_ids TEXT[],
  session_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on webhook_events table
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access to webhook events
CREATE POLICY "Admins can view all webhook events" 
ON public.webhook_events 
FOR SELECT 
USING (public.is_admin_user());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_timestamp ON public.webhook_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_conversation_id ON public.webhook_events(conversation_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_webhook_events_updated_at
  BEFORE UPDATE ON public.webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();