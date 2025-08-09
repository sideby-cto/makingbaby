import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { StoryModule } from 'src/story/story.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Story, StorySchema } from 'src/story/entities/story.entity';
import {
  School,
  SchoolSchema,
} from 'src/configuration/school/entities/school.entity';
import { DistrictService } from 'src/configuration/district/district.service';
import {
  District,
  DistrictSchema,
} from 'src/configuration/district/entities/district.entity';
import { SchoolService } from 'src/configuration/school/school.service';
import {
  StudentCharactice,
  StudentCharacticeSchema,
} from 'src/configuration/student-charactice/entities/student-charactice.entity';
import {
  PromisingPractise,
  PromisingPractiseSchema,
} from 'src/configuration/promising-pratice/entities/promising-pratice.entity';
import {
  StudentSuccessSign,
  StudentSuccessSignSchema,
} from 'src/configuration/student-success-sign/entities/student-success-sign.entity';
import { TeamService } from 'src/configuration/team/team.service';
import { Team, TeamSchema } from 'src/configuration/team/entities/team.entity';
import { UserService } from 'src/user/user.service';
import { User, UserSchema } from 'src/user/entities/user.entity';

@Module({
  imports: [
    StoryModule,
    MongooseModule.forFeature([
      { name: Story.name, schema: StorySchema },
      { name: School.name, schema: SchoolSchema },
      { name: District.name, schema: DistrictSchema },
      { name: StudentCharactice.name, schema: StudentCharacticeSchema },
      { name: PromisingPractise.name, schema: PromisingPractiseSchema },
      { name: StudentSuccessSign.name, schema: StudentSuccessSignSchema },
      { name: Team.name, schema: TeamSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, SchoolService, TeamService, UserService, DistrictService],
})
export class DashboardModule {}
