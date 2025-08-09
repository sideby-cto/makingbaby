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
exports.ReminderService = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification-service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const schedule_1 = require("@nestjs/schedule");
const story_entity_1 = require("../story/entities/story.entity");
const user_service_1 = require("../user/user.service");
const config_1 = require("@nestjs/config");
let ReminderService = class ReminderService {
    constructor(storyModel, notificationService, userService, configService) {
        this.storyModel = storyModel;
        this.notificationService = notificationService;
        this.userService = userService;
        this.configService = configService;
    }
    async handleReminder() {
        if (this.configService.get('REMINDER_SENDING_ON') !== 'true') {
            return;
        }
        const today = new Date();
        const weekOfMonth = Math.ceil(today.getDate() / 7);
        if (weekOfMonth === 1 || weekOfMonth === 3) {
            const inactiveUsers = await this.getInactiveUsers();
            const inactiveUserEmails = [];
            for (let userId of inactiveUsers) {
                const user = await this.userService.findOne(userId);
                if (user && user.email && !user.inactive) {
                    inactiveUserEmails.push(user.email);
                }
            }
            this.notificationService.sendEmailNotification(inactiveUserEmails, "reminder");
        }
    }
    async getInactiveUsers() {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const inactiveUsers = await this.storyModel.aggregate([
            {
                $match: {
                    $or: [
                        { userId: { $exists: true, $ne: null } },
                        { author: { $exists: true, $ne: null } }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $ifNull: ["$author", "$userId"]
                    },
                    latestStory: { $max: "$createdAt" }
                }
            },
            {
                $match: {
                    latestStory: { $lt: twoWeeksAgo }
                }
            },
            {
                $project: {
                    userId: "$_id",
                    _id: 0
                }
            }
        ]);
        const userIds = inactiveUsers.map(user => user.userId);
        return userIds;
    }
};
exports.ReminderService = ReminderService;
__decorate([
    (0, schedule_1.Cron)('0 0 * * 3'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReminderService.prototype, "handleReminder", null);
exports.ReminderService = ReminderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(story_entity_1.Story.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        notification_service_1.NotificationService,
        user_service_1.UserService,
        config_1.ConfigService])
], ReminderService);
//# sourceMappingURL=reminder.service.js.map