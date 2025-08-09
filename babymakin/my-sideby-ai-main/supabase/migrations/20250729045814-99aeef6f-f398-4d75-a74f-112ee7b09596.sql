-- Enable realtime for activity_scores table
ALTER TABLE public.activity_scores REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.activity_scores;

-- Enable realtime for engagement_logs table  
ALTER TABLE public.engagement_logs REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.engagement_logs;

-- Enable realtime for activity_based_matches table
ALTER TABLE public.activity_based_matches REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.activity_based_matches;

-- Create function to automatically update activity scores when engagement is logged
CREATE OR REPLACE FUNCTION update_activity_score_on_engagement()
RETURNS TRIGGER AS $$
BEGIN
  -- Schedule score recalculation by inserting into a queue table
  -- This will be processed by the real-time service
  PERFORM pg_notify('activity_score_update', NEW.user_id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for engagement log updates
DROP TRIGGER IF EXISTS trigger_update_activity_score_on_engagement ON public.engagement_logs;
CREATE TRIGGER trigger_update_activity_score_on_engagement
  AFTER INSERT ON public.engagement_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_score_on_engagement();

-- Create index for better real-time performance
CREATE INDEX IF NOT EXISTS idx_activity_scores_user_id_updated ON public.activity_scores(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_logs_user_id_created ON public.engagement_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_matches_users_status ON public.activity_based_matches(user1_id, user2_id, status, created_at DESC);