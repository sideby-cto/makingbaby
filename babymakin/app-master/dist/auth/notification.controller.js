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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification-service");
const user_service_1 = require("../user/user.service");
let NotificationController = class NotificationController {
    constructor(notificationService, userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }
    async sendNotification(notificationData) {
        let emailParams;
        switch (notificationData.notificationType) {
            case "tagging":
                emailParams = await this.taggingParameters(notificationData);
                await this.notificationService.sendEmailNotification(emailParams, notificationData.notificationType);
                break;
            default:
                throw new Error('Unsupported notification type');
        }
        return { success: true, message: `${notificationData.notificationType} notification sent successfully` };
    }
    async taggingParameters(notificationData) {
        const { storyAuthorId, taggedUsersId, postedBy } = notificationData;
        const storyAuthorDetails = await this.userService.findOne(storyAuthorId);
        let storyAuthor;
        if (storyAuthorDetails) {
            storyAuthor = storyAuthorDetails.name;
        }
        const taggedUserEmails = [];
        for (let userId of taggedUsersId) {
            const user = await this.userService.findOne(userId);
            if (user && user.email) {
                taggedUserEmails.push(user.email);
            }
        }
        return { storyAuthor, taggedUserEmails, postedBy };
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendNotification", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)('notification'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        user_service_1.UserService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map