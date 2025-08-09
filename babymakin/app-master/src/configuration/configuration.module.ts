import { Module } from '@nestjs/common';
import { SchoolModule } from './school/school.module';
import { SchoolClassificationModule } from './school-classification/school-classification.module';
import { DistrictModule } from './district/district.module';
import { GoalModule } from './goal/goal.module';
import { TeamModule } from './team/team.module';
import { OrganizationModule } from './organization/organization.module';
import { PromisingPraticeModule } from './promising-pratice/promising-pratice.module';
import { StudentSuccessSignModule } from './student-success-sign/student-success-sign.module';
import { StudentCharacticeModule } from './student-charactice/student-charactice.module';

@Module({
  imports: [
    SchoolModule,
    SchoolClassificationModule,
    DistrictModule,
    GoalModule,
    TeamModule,
    OrganizationModule,
    PromisingPraticeModule,
    StudentSuccessSignModule,
    StudentCharacticeModule,
  ],
})
export class ConfigurationModule {}
