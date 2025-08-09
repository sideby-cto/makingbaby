import { ConfigService } from '@nestjs/config';
import { EmailService } from './email-service';
export declare class MagicLinkService {
    private readonly emailService;
    private readonly configService;
    constructor(emailService: EmailService, configService: ConfigService);
    sendVerificationLink(email: string, token: string, origin: string): Promise<any>;
}
