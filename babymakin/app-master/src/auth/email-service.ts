import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
const sesClient = new SESClient({ region: "us-east-1" });

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendMail(options: any) {
    const command = new SendEmailCommand({
      Destination: {
        CcAddresses: [],
        ToAddresses: [
          this.configService.get('EMAIL_TEST_ADDRESS') || options.to,
        ],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: options.message.html,
          },
          Text: {
            Charset: 'UTF-8',
            Data: options.message.text,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: options.subject,
        },
      },
      Source: options.from,
    });

    if (this.configService.get('EMAIL_SENDING_ON') !== 'true') {
      console.log('Not sending email.');
      console.log('Subject: ' + options.subject);
      console.log('To: ' + options.to);
      console.log('Message: ' + options.message.text);
      return;
    }

    try {
      return await sesClient.send(command);
    } catch (e) {
      console.error('Failed to send email.');
      console.error(e);
      return e;
    }
  }
}
