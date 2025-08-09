import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SchoolClassificationDocument = SchoolClassification & Document;

@Schema({ timestamps: true })
export class SchoolClassification {
  @Prop({ required: true })
  name: string;
}

export const SchoolClassificationSchema = SchemaFactory.createForClass(SchoolClassification);
