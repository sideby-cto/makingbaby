"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("./email-service");
let NotificationService = class NotificationService {
    constructor(emailService) {
        this.emailService = emailService;
    }
    sendEmailNotification(emailParams, type) {
        switch (type) {
            case "tagging":
                emailParams.taggedUserEmails.forEach((email) => {
                    return this.emailService.sendMail({
                        from: 'Small Wins Dashboard <admin@smallwinsdashboard.com>',
                        to: email,
                        subject: 'You\'re a (Small) Winner! 🏆',
                        message: {
                            html: `<p>Hi there,</p><p>You've been tagged by ${emailParams.postedBy != null ? emailParams.storyAuthor : "Anonymous"}.</p><p>Log on, go to your My Stories page, and celebrate the win!</p><p><a href="https://app.smallwinsdashboard.com/login">Small Wins Dashboard Page</a></p><br><br><p>Keep it going!</p><p>The Small Wins Team</p>`,
                            text: `Hi there, You've been tagged by ${emailParams.postedBy != null ? emailParams.storyAuthor : "Anonymous"}. Log on, go to your My Stories page, and celebrate the win!`
                        }
                    });
                });
                break;
            case "reminder":
                emailParams.forEach((email) => {
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], NotificationService);
//# sourceMappingURL=notification-service.js.map