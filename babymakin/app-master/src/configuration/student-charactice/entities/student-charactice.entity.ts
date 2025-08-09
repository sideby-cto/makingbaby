import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type StudentCharacticeDocument = StudentCharactice & Document;
@Schema({ timestamps: true })
export class StudentCharactice {
  @Prop({ required: true })
  name: string;
}

export const StudentCharacticeSchema =
  SchemaFactory.createForClass(StudentCharactice);
