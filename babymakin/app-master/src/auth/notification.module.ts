import { Module } from '@nestjs/common';
import { EmailService } from './email-service';
import { ConfigModule } from '@nestjs/config';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification-service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot(),
  ],
  providers: [
    EmailService,
    NotificationService
  ],
  controllers: [NotificationController],
})
export class NotificationModule {}
