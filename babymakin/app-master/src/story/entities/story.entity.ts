import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { District } from '../../configuration/district/entities/district.entity';
import { PromisingPractise } from '../../configuration/promising-pratice/entities/promising-pratice.entity';
import { School } from '../../configuration/school/entities/school.entity';
import { StudentCharactice } from '../../configuration/student-charactice/entities/student-charactice.entity';
import { StudentSuccessSign } from '../../configuration/student-success-sign/entities/student-success-sign.entity';
import { User } from '../../user/entities/user.entity';

export type StoryDocument = Story & Document;

export type StoryType = 'SW' | 'LL';
@Schema({ timestamps: true })
export class Story {
  @Prop({ required: true })
  type: StoryType;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
  })
  author: string;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
  })
  userId: string;

  @Prop({ required: false })
  storyAction: string;

  @Prop({ required: false, default: 0 })
  likes: number;

  @Prop({ required: false, default: 0 })
  high5s: number;

  @Prop({ required: false, default: 0 })
  Insighfuls: number;

  @Prop({ required: false })
  storyExperience: string;

  @Prop({ required: false })
  storyObservation: string;

  @Prop({
    type: [Types.ObjectId],
    default: [],
    ref: StudentSuccessSign.name,
  })
  successSigns: string[];

  @Prop({
    type: [Types.ObjectId],
    default: [],
    ref: StudentCharactice.name,
  })
  studentCharacteristics: string[];

  @Prop({
    type: [Types.ObjectId],
    default: [],
    ref: PromisingPractise.name,
  })
  promisingPractices: string[];

  @Prop({
    type: [Types.ObjectId],
    default: [],
    ref: 'StoryFile',
  })
  files: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: District.name })
  district: District;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: School.name })
  school: School;

  @Prop({
    type: Types.ObjectId,
    default: [],
    ref: User.name,
  })
  taggedUsersId: string[];
}

export const StorySchema = SchemaFactory.createForClass(Story);
