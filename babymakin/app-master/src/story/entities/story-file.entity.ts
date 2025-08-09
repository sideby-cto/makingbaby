import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Story } from './story.entity';

export type StoryFileDocument = StoryFile & Document;

@Schema({ timestamps: true })
export class StoryFile {
  @Prop({ required: true })
  url: string;

  // @Prop({
  //   type: Types.ObjectId,
  //   ref: Story.name,
  //   required: true,
  // })
  // story: string;
}

export const StoryFilesSchema = SchemaFactory.createForClass(StoryFile);
