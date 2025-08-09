import { NotificationService } from './notification-service';
import { UserService } from 'src/user/user.service';
export declare class NotificationController {
    private notificationService;
    private readonly userService;
    constructor(notificationService: NotificationService, userService: UserService);
    sendNotification(notificationData: any): Promise<{
        success: boolean;
        message: string;
    }>;
    private taggingParameters;
}
