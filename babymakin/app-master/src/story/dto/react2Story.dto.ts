import { ReactionType } from '../entities/story-reaction.entity';

export class React2StoryDto {
  type: ReactionType;
  reactedBy: string;
  story: string;
}
