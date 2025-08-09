import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    constructor(configService: ConfigService);
    sendMail(options: any): Promise<any>;
}
