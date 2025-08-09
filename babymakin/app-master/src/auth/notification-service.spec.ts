import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification-service';
import { EmailService } from './email-service';
import { ConfigService } from '@nestjs/config';

describe('NotificationService', () => {
    let notificationService: NotificationService;
    let emailService: EmailService;
    let configService: ConfigService;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          {
            provide: EmailService,
            useValue: {
              sendMail: jest.fn(),
            },
          },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(),
            },
          },
        ],
      }).compile();
  
      notificationService = module.get<NotificationService>(NotificationService);
      emailService = module.get<EmailService>(EmailService);
      configService = module.get<ConfigService>(ConfigService);
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    describe('sendEmailNotification', () => {
      it('should send tagging emails when EMAIL_SENDING_ON is true', async () => {
        jest.spyOn(configService, 'get').mockImplementation((key: string) => {
          if (key === 'EMAIL_SENDING_ON') return 'true';
          return null;
        });
  
        const emailParams = {
          taggedUserEmails: ['user1@example.com', 'user2@example.com'],
          storyAuthor: 'Test Author',
        };
  
        await notificationService.sendEmailNotification(emailParams, 'tagging');
  
        expect(emailService.sendMail).toHaveBeenCalledTimes(2);
        expect(emailService.sendMail).toHaveBeenCalledWith({
          from: 'Small Wins Dashboard <admin@smallwinsdashboard.com>',
          to: 'user1@example.com',
          subject: 'You\'re a (Small) Winner! 🏆',
          message: expect.any(Object),
        });
        expect(emailService.sendMail).toHaveBeenCalledWith({
          from: 'Small Wins Dashboard <admin@smallwinsdashboard.com>',
          to: 'user2@example.com',
          subject: 'You\'re a (Small) Winner! 🏆',
          message: expect.any(Object),
        });
      });
  
      it('should not send tagging emails when EMAIL_SENDING_ON is false', async () => {
        jest.spyOn(configService, 'get').mockReturnValue('false');
  
        const emailParams = {
          taggedUserEmails: ['user1@example.com', 'user2@example.com'],
          storyAuthor: 'Test Author',
        };
  
        await notificationService.sendEmailNotification(emailParams, 'tagging');
  
        expect(emailService.sendMail).not.toHaveBeenCalled();
      });
  
      it('should send reminder emails when REMINDER_SENDING_ON is true', async () => {
        jest.spyOn(configService, 'get').mockImplementation((key: string) => {
          if (key === 'REMINDER_SENDING_ON') return 'true';
          return null;
        });
  
        const emailParams = ['user1@example.com', 'user2@example.com'];
  
        await notificationService.sendEmailNotification(emailParams, 'reminder');
  
        expect(emailService.sendMail).toHaveBeenCalledTimes(2);
        expect(emailService.sendMail).toHaveBeenCalledWith({
          from: 'Small Wins Dashboard <admin@smallwinsdashboard.com>',
          to: 'user1@example.com',
          subject: 'Log In to (Small) Win',
          message: expect.any(Object),
        });
        expect(emailService.sendMail).toHaveBeenCalledWith({
          from: 'Small Wins Dashboard <admin@smallwinsdashboard.com>',
          to: 'user2@example.com',
          subject: 'Log In to (Small) Win',
          message: expect.any(Object),
        });
      });
  
      it('should not send reminder emails when REMINDER_SENDING_ON is false', async () => {
        jest.spyOn(configService, 'get').mockReturnValue('false');
  
        const emailParams = ['user1@example.com', 'user2@example.com'];
  
        await notificationService.sendEmailNotification(emailParams, 'reminder');
  
        expect(emailService.sendMail).not.toHaveBeenCalled();
      });
    });
  });