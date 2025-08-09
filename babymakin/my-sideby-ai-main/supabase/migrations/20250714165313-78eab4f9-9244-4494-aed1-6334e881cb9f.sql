-- Create trigger to handle new chat messages in match_scheduling_messages
-- This will call the existing handle_new_chat_message function when messages are inserted

CREATE TRIGGER trigger_new_match_scheduling_message
  AFTER INSERT ON public.match_scheduling_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_chat_message();