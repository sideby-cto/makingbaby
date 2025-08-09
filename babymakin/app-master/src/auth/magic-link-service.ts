import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email-service';

@Injectable()
export class MagicLinkService {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  public sendVerificationLink(email: string, token: string, origin: string) {
    const baseUrl = origin ? origin : this.configService.get("APP_URL");
    const url     = `${baseUrl}?token=${token}`;

    return this.emailService.sendMail({
      from: 'Small Wins Dashboard <admin@smallwinsdashboard.com>',
      to: email,
      subject: 'Welcome to the Small Wins Dashboard!',
      message: {
        html: `<p>Hi there,</p><p>You've been added as a Small Wins Dashboard user. Please click the link below to start sharing your wisdom with the rest of your team:</p><p>${url}</p>`,
        text: `Hi there, You've been added as a Small Wins Dashboard user. Please click the link below to start sharing your wisdom with the rest of your team: ${url}`
      }
    });
  }
}
