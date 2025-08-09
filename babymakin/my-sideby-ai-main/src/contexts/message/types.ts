
import { MatchMessage } from '@/components/dashboard/scheduling/types';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
}

export interface MessageContextType {
  messages: MatchMessage[];
  setMessages: (messages: MatchMessage[] | ((prev: MatchMessage[]) => MatchMessage[])) => void;
  isSenderAdmin: (senderId: string, senderType?: string) => boolean;
  getSenderName: (message: MatchMessage | { sender_id: string; sender_type?: string }, currentUserId?: string | null) => string;
  getSenderAvatar: (message: MatchMessage | { sender_id: string; sender_type?: string }, partnerInfo?: { avatar_url?: string } | null) => string | undefined;
  getMatchRationale: (matchId: string) => string | null;
  setMatchRationale: (matchId: string, rationale: string | null) => void;
}
