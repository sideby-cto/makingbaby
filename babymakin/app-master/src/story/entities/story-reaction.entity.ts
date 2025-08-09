import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { Story } from './story.entity';

export type StoryDocument = StoryReaction & Document;

export type ReactionType = 'High5' | 'Like' | 'Insighful';
@Schema({ timestamps: true })
export class StoryReaction {
  @Prop({ required: true })
  type: ReactionType;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
  })
  user: string;

  @Prop({
    type: Types.ObjectId,
    ref: Story.name,
  })
  story: string;
}

export const StoryReactionSchema = SchemaFactory.createForClass(StoryReaction);
