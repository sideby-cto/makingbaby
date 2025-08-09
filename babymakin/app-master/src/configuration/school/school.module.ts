import { Module } from '@nestjs/common';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { School, SchoolSchema } from './entities/school.entity';
import {
  StudentCharactice,
  StudentCharacticeSchema,
} from '../student-charactice/entities/student-charactice.entity';
import { StudentCharacticeModule } from '../student-charactice/student-charactice.module';
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
      { name: School.name, schema: SchoolSchema },
      { name: StudentCharactice.name, schema: StudentCharacticeSchema },
      { name: PromisingPractise.name, schema: PromisingPractiseSchema },
      { name: StudentSuccessSign.name, schema: StudentSuccessSignSchema },
    ]),
    StudentCharacticeModule,
  ],
  controllers: [SchoolController],
  providers: [SchoolService],
  exports: [SchoolService],
})
export class SchoolModule {}
