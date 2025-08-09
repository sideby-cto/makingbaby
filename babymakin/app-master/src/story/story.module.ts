import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Story, StorySchema } from './entities/story.entity';
import { MulterModule } from '@nestjs/platform-express';
import { StoryFile, StoryFilesSchema } from './entities/story-file.entity';
import { StoryFilesService } from './story-files.service';
import { FileUploadService } from './file-upload-service';
import {
  StoryReaction,
  StoryReactionSchema,
} from './entities/story-reaction.entity';
import { SchoolService } from 'src/configuration/school/school.service';
import {
  School,
  SchoolSchema,
} from 'src/configuration/school/entities/school.entity';
import {
  PromisingPractise,
  PromisingPractiseSchema,
} from 'src/configuration/promising-pratice/entities/promising-pratice.entity';
import {
  StudentCharactice,
  StudentCharacticeSchema,
} from 'src/configuration/student-charactice/entities/student-charactice.entity';
import {
  StudentSuccessSign,
  StudentSuccessSignSchema,
} from 'src/configuration/student-success-sign/entities/student-success-sign.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoryReaction.name, schema: StoryReactionSchema },
      { name: Story.name, schema: StorySchema },
      { name: StoryFile.name, schema: StoryFilesSchema },
      { name: School.name, schema: SchoolSchema },
      { name: StudentCharactice.name, schema: StudentCharacticeSchema },
      { name: PromisingPractise.name, schema: PromisingPractiseSchema },
      { name: StudentSuccessSign.name, schema: StudentSuccessSignSchema },
    ]),
    MulterModule.register({
      dest: 'uploads/',
    }),
  ],
  controllers: [StoryController],

  providers: [StoryService, StoryFilesService, SchoolService, FileUploadService],
})
export class StoryModule {}
