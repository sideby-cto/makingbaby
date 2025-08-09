import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {
  District,
  DistrictGoal,
  DistrictGoalSchema,
} from '../../district/entities/district.entity';
import { SchoolClassification } from '../../school-classification/entities/school-classification.entity';

export type SchoolDocument = School & Document;
@Schema({ timestamps: true })
export class School {
  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: SchoolClassification.name })
  schoolClassification: SchoolClassification;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: District.name })
  district: District;

  @Prop({ type: [DistrictGoalSchema], default: [] })
  schoolGoals: DistrictGoal[];
}

export const SchoolSchema = SchemaFactory.createForClass(School);
