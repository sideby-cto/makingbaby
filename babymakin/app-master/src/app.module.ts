import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './configuration/configuration.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { StoryModule } from './story/story.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DashboardModule } from './dashboard/dashboard.module';
import path = require('path');
import { NotificationModule } from './auth/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReminderModule } from './auth/reminder.module';

const useSSL = process.env.DB_USE_SSL === 'true';

@Module({
  imports: [
    ConfigurationModule,
    UserModule,
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      process.env.DB_CONNECTION_STRING ? process.env.DB_CONNECTION_STRING : '',
      {
        ssl: useSSL,
        sslValidate: useSSL,
        sslCA: path.join(`./global-bundle.pem`),
        retryAttempts: 1,
        retryDelay: 10,
      },
    ),

    EventEmitterModule.forRoot(),
    AuthModule,
    StoryModule,
    NotificationModule,
    ReminderModule,

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
