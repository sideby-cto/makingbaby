import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { District } from '../../configuration/district/entities/district.entity';
import { School } from '../../configuration/school/entities/school.entity';
import { Team } from '../../configuration/team/entities/team.entity';
import { Organization } from 'src/configuration/organization/entities/organization.entity';

export type UserStatusType =
  | 'Admin'
  | 'District Leader'
  | 'School Leader'
  | 'Staff Member'
  | 'Organization Leader';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: District.name })
  district: District;

  @Prop({ type: [Types.ObjectId], ref: School.name })
  schools: School[];

  @Prop({ type: [Types.ObjectId], ref: Team.name })
  teams: Team[];

  @Prop({ type: Types.ObjectId, ref: Organization.name })
  organization: Organization;

  @Prop({ type: Types.ObjectId, ref: Team.name })
  mainTeam: Team;

  @Prop()
  permissionLevel: UserStatusType;

  @Prop()
  inactive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
