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
exports.MagicLinkService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const email_service_1 = require("./email-service");
let MagicLinkService = class MagicLinkService {
    constructor(emailService, configService) {
        this.emailService = emailService;
        this.configService = configService;
    }
    sendVerificationLink(email, token, origin) {
        const baseUrl = origin ? origin : this.configService.get("APP_URL");
        const url = `${baseUrl}?token=${token}`;
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
};
exports.MagicLinkService = MagicLinkService;
exports.MagicLinkService = MagicLinkService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_service_1.EmailService,
        config_1.ConfigService])
], MagicLinkService);
//# sourceMappingURL=magic-link-service.js.map