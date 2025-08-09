import { Module } from '@nestjs/common';
import { DistrictService } from './district.service';
import { DistrictController } from './district.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { District, DistrictSchema } from './entities/district.entity';
import { SchoolService } from '../school/school.service';
import { School, SchoolSchema } from '../school/entities/school.entity';
import {
  StudentCharactice,
  StudentCharacticeSchema,
} from '../student-charactice/entities/student-charactice.entity';
import {
  PromisingPractise,
  PromisingPractiseSchema,
} from '../promising-pratice/entities/promising-pratice.entity';
import {
  StudentSuccessSign,
  StudentSuccessSignSchema,
} from '../student-success-sign/entities/student-success-sign.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: District.name, schema: DistrictSchema },
      { name: School.name, schema: SchoolSchema },
      { name: StudentCharactice.name, schema: StudentCharacticeSchema },
      { name: PromisingPractise.name, schema: PromisingPractiseSchema },
      { name: StudentSuccessSign.name, schema: StudentSuccessSignSchema },
    ]),
  ],
  controllers: [DistrictController],
  providers: [DistrictService, SchoolService],
  exports: [DistrictService],
})
export class DistrictModule {}
