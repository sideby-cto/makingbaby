import { Module } from '@nestjs/common';
import { StudentSuccessSignService } from './student-success-sign.service';
import { StudentSuccessSignController } from './student-success-sign.controller';
import {
  StudentSuccessSign,
  StudentSuccessSignSchema,
} from './entities/student-success-sign.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentSuccessSign.name, schema: StudentSuccessSignSchema },
    ]),
  ],
  controllers: [StudentSuccessSignController],
  providers: [StudentSuccessSignService],
})
export class StudentSuccessSignModule {}
