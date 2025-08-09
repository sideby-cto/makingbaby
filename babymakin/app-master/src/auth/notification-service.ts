import { Injectable } from '@nestjs/common';
import { EmailService } from './email-service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
  ) {}

  public sendEmailNotification(emailParams: any, type: string) {
    switch(type) {
      case "tagging":
        emailParams.taggedUserEmails.forEach((email: any) => {
          return this.emailService.sendMail({
            from: 'Small Wins Dashboard <admin@smallwinsdashboard.com>',
            to: email,
            subject: 'You\'re a (Small) Winner! 🏆',
            message: {
              html: `<p>Hi there,</p><p>You've been tagged by ${ emailParams.postedBy != null ? emailParams.storyAuthor : "Anonymous" }.</p><p>Log on, go to your My Stories page, and celebrate the win!</p><p><a href="https://app.smallwinsdashboard.com/login">Small Wins Dashboard Page</a></p><br><br><p>Keep it going!</p><p>The Small Wins Team</p>`,
              text: `Hi there, You've been tagged by ${ emailParams.postedBy != null ? emailParams.storyAuthor : "Anonymous" }. Log on, go to your My Stories page, and celebrate the win!`
            }
          });
        });
        break;
      
      case "reminder":
        emailParams.forEach((email: any) => {
          return this.emailService.sendMail({
            from: 'Small Wins Dashboard <admin@smallwinsdashboard.com>',
            to: email,
            subject: 'Log In to (Small) Win',
            message: {
              html: `<p>Hi there,</p><p>Where have you been? We’ve noticed you haven’t logged onto your Small Wins Dashboard recently. So here’s a friendly reminder of how to log on and what the SWD can do for you:</p><p>If you <b>misplaced your link</b>, you can log on <a href="https://app.smallwinsdashboard.com/login">here</a>.</p><br><h3>Share a Small Win Story:</h3><ul><li>To guide your next steps</li><li>To fuel your professional growth</li><li>To strengthen your team's wisdom & efficacy</li></ul><h3>Learn from your team's Small Wins evidence:</h3><ul><li>To see patterns of practice</li><li>To learn in real-time what's working, for whom</li><li>To get fresh ideas for your own work</li></ul><p><b>Need additional support?</b> Email us at: <a href="mailto:admin@smallwinsdashboard.com">admin@smallwinsdashboard.com</a></p><br><p>Take care,</p><p>The Small Wins Team</p>`,
              text: `Hi there, Where have you been? We’ve noticed you haven’t logged onto your Small Wins Dashboard recently. So here’s a friendly reminder of how to log on and what the SWD can do for you: If you misplaced your link, you can log on here: https://app.smallwinsdashboard.com/login. Share a Small Win Story: -To guide your next steps -To fuel your professional growth -To strengthen your team's wisdom & efficacy. Learn from your team's Small Wins evidence: -To see patterns of practice -To learn in real-time what's working, for whom -To get fresh ideas for your own work. Need additional support? Email us at: admin@smallwinsdashboard.com. Take care, The Small Wins Team`
            }
          });
        });
        break;

      default:
        throw new Error('Unsupported notification type');
    }    
  }
}
