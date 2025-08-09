import { Module } from '@nestjs/common';
import { StudentCharacticeService } from './student-charactice.service';
import { StudentCharacticeController } from './student-charactice.controller';
import {
  StudentCharactice,
  StudentCharacticeSchema,
} from './entities/student-charactice.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentCharactice.name, schema: StudentCharacticeSchema },
    ]),
  ],
  controllers: [StudentCharacticeController],
  providers: [StudentCharacticeService],
})
export class StudentCharacticeModule {}
