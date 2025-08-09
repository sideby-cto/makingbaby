
import React from "react";
import { SchedulingChatContainer } from "./containers/SchedulingChatContainer";

interface MatchProps {
  id: string;
  user1_id: string;
  user2_id: string;
  status?: string;
  completed_at?: string;
  completion_notes?: string | null;
  completed_by?: string | null;
  upduo_session_id?: string | null;
  upduo_session_name?: string | null;
  rationale?: string;
  created_at?: string;
  user1?: {
    id?: string;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  };
  user2?: {
    id?: string;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  };
}

interface SchedulingChatProps {
  match: MatchProps;
  userId: string;
}

function SchedulingChat({ match, userId }: SchedulingChatProps) {
  return <SchedulingChatContainer match={match} userId={userId} />;
}

export default SchedulingChat;
