import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Organization } from '../../organization/entities/organization.entity';
import { Goal } from '../../goal/entities/goal.entity';
import { PromisingPractise } from '../../promising-pratice/entities/promising-pratice.entity';
import { StudentCharactice } from '../../student-charactice/entities/student-charactice.entity';
import { StudentSuccessSign } from '../../student-success-sign/entities/student-success-sign.entity';

@Schema()
export class DistrictGoal extends Document {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: Goal.name,
  })
  goal: Types.ObjectId;

  @Prop({
    type: [Types.ObjectId],
    default: [],
    ref: PromisingPractise.name,
  })
  promisingPractices: string[];

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
}
export const DistrictGoalSchema = SchemaFactory.createForClass(DistrictGoal);

export type DistrictDocument = District & Document;
@Schema({ timestamps: true })
export class District {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: Organization.name })
  organization: Organization;

  @Prop({ type: [DistrictGoalSchema], default: [] })
  districtGoals: DistrictGoal[];
}

export const DistrictSchema = SchemaFactory.createForClass(District);
