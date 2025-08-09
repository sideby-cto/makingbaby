import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type StudentSuccessSignDocument = StudentSuccessSign & Document;
@Schema({ timestamps: true })
export class StudentSuccessSign {
  @Prop({ required: true })
  name: string;
}

export const StudentSuccessSignSchema =
  SchemaFactory.createForClass(StudentSuccessSign);
