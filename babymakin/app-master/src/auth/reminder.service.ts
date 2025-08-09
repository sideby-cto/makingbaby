import { Injectable } from '@nestjs/common';
import { NotificationService } from './notification-service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Story, StoryDocument as StoryDoc } from 'src/story/entities/story.entity';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReminderService {
  constructor (
    @InjectModel(Story.name) private storyModel: Model<StoryDoc>,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 0 * * 3') // Wednesdays at midnight
  async handleReminder() {
    if (this.configService.get('REMINDER_SENDING_ON') !== 'true') {
      return;
    }

    const today = new Date();
    const weekOfMonth = Math.ceil(today.getDate() / 7);

    if (weekOfMonth === 1 || weekOfMonth === 3) {
      const inactiveUsers = await this.getInactiveUsers();
      const inactiveUserEmails: string[] = [];

      for (let userId of inactiveUsers) {
        const user = await this.userService.findOne(userId);

        if (user && user.email && !user.inactive) {
          inactiveUserEmails.push(user.email);
        }
      }

      this.notificationService.sendEmailNotification(inactiveUserEmails, "reminder");
    }
  }

  async getInactiveUsers() {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const inactiveUsers = await this.storyModel.aggregate([
      {
        $match: {
          $or: [
            { userId: { $exists: true, $ne: null } },
            { author: { $exists: true, $ne: null } }
          ] 
        }
      },
      {
        $group: {
          _id: {
            $ifNull: ["$author", "$userId"]
          },
          latestStory: { $max: "$createdAt" }
        }
      },
      {
        $match: {
          latestStory: { $lt: twoWeeksAgo }
        }
      },
      {
        $project: {
          userId: "$_id",
          _id: 0
        }
      }
    ]);

    const userIds = inactiveUsers.map(user => user.userId);
    return userIds;
  }
}