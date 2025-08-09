import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PromisingPractiseDocument = PromisingPractise & Document;
@Schema({ timestamps: true })
export class PromisingPractise {
  @Prop({ required: true })
  name: string;
}

export const PromisingPractiseSchema =
  SchemaFactory.createForClass(PromisingPractise);
