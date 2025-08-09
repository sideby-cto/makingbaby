import { Module } from '@nestjs/common';
import { PromisingPraticeService } from './promising-pratice.service';
import { PromisingPraticeController } from './promising-pratice.controller';
import {
  PromisingPractise,
  PromisingPractiseSchema,
} from './entities/promising-pratice.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PromisingPractise.name, schema: PromisingPractiseSchema },
    ]),
  ],
  controllers: [PromisingPraticeController],
  providers: [PromisingPraticeService],
})
export class PromisingPraticeModule {}
