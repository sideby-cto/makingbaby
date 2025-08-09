import { EmailService } from './email-service';
export declare class NotificationService {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendEmailNotification(emailParams: any, type: string): void;
}
