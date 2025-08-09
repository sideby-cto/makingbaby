import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification-service';
import { UserService } from 'src/user/user.service';

@Controller('notification')
export class NotificationController {
    constructor(
        private notificationService: NotificationService,
        private readonly userService: UserService
      ) {}

      @Post()
      async sendNotification(@Body() notificationData: any) {
        let emailParams: any;

        switch(notificationData.notificationType) {

          case "tagging": 
            emailParams = await this.taggingParameters(notificationData);
            await this.notificationService.sendEmailNotification(emailParams, notificationData.notificationType);
            break;
          
          default:
            throw new Error('Unsupported notification type');
        }

        return { success: true, message: `${notificationData.notificationType} notification sent successfully`};
      }

      private async taggingParameters(notificationData: any) {
        const { storyAuthorId, taggedUsersId, postedBy } = notificationData;

        const storyAuthorDetails = await this.userService.findOne(storyAuthorId);
        let storyAuthor: any;

        if (storyAuthorDetails) {
          storyAuthor = storyAuthorDetails.name;
        }

        const taggedUserEmails: string[] = [];

        for (let userId of taggedUsersId) {
        const user = await this.userService.findOne(userId);

        if (user && user.email) {
        taggedUserEmails.push(user.email);
        }
      }
        return {storyAuthor, taggedUserEmails, postedBy };
      }
}