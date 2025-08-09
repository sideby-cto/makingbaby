
import { Profile } from "../types/matchmaking";

export interface MatchingAreaProps {
  onMatch: () => Promise<void>;
}

export interface DroppedUserProps {
  profile: Profile;
  onRemove: (profileId: string) => void;
}

export interface MatchingAreaContentProps {
  droppedUsers: Profile[];
  onRemoveUser: (profileId: string) => void;
  onRemoveAllUsers?: () => void;
  matchDescription: string;
  onMatchDescriptionChange: (description: string) => void;
  onMatch: () => void;
  isDragActive?: boolean;
}
