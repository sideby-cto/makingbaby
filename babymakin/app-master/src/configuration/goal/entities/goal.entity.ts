import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GoalDocument = Goal & Document;
@Schema({ timestamps: true })
export class Goal {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  isDistrictLevel: boolean;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
