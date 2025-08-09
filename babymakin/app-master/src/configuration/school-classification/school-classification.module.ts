import { Module } from '@nestjs/common';
import { SchoolClassificationService } from './school-classification.service';
import { SchoolClassificationController } from './school-classification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolClassification, SchoolClassificationSchema } from './entities/school-classification.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SchoolClassification.name, schema: SchoolClassificationSchema },
    ]),
  ],
  controllers: [SchoolClassificationController],
  providers: [SchoolClassificationService],
})
export class SchoolClassificationModule {}
