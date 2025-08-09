import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { NotificationService } from './notification-service';
import { EmailService } from './email-service';
import { StoryService } from 'src/story/story.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { StoryModule } from 'src/story/story.module';
import { SchoolService } from 'src/configuration/school/school.service';
import { StoryFilesService } from 'src/story/story-files.service';
import { Story, StorySchema } from 'src/story/entities/story.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { StoryReaction, StoryReactionSchema } from 'src/story/entities/story-reaction.entity';
import { StoryFile, StoryFilesSchema } from 'src/story/entities/story-file.entity';
import { School, SchoolSchema } from 'src/configuration/school/entities/school.entity';
import { StudentCharactice, StudentCharacticeSchema } from 'src/configuration/student-charactice/entities/student-charactice.entity';
import { PromisingPractise, PromisingPractiseSchema } from 'src/configuration/promising-pratice/entities/promising-pratice.entity';
import { StudentSuccessSign, StudentSuccessSignSchema } from 'src/configuration/student-success-sign/entities/student-success-sign.entity';
import { FileUploadService } from 'src/story/file-upload-service';


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
        UserModule,
        ConfigModule.forRoot(),
        StoryModule,
        
      ],
    providers: [
        ReminderService,
        NotificationService,
        EmailService,
        StoryService,
        SchoolService,
        StoryFilesService,
        FileUploadService
    ],
  })
  export class ReminderModule {}