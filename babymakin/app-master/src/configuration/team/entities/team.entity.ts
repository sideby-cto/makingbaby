import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {
  DistrictGoal,
  DistrictGoalSchema,
} from '../../district/entities/district.entity';
import { School } from '../../school/entities/school.entity';

export type TeamDocument = Team & Document;
@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: School.name })
  school: School;

  @Prop({ type: [DistrictGoalSchema], default: [] })
  teamGoals: DistrictGoal[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
