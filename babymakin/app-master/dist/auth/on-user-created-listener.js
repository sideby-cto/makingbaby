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
exports.OnUserCreatedListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const userCreatedEvent_1 = require("../core/events/userCreatedEvent");
const user_service_1 = require("../user/user.service");
const auth_service_1 = require("./auth.service");
const magic_link_service_1 = require("./magic-link-service");
let OnUserCreatedListener = class OnUserCreatedListener {
    constructor(authService, userService, magicLinkService) {
        this.authService = authService;
        this.userService = userService;
        this.magicLinkService = magicLinkService;
    }
    async handleUserCreatedEvent(payload) {
        const user = await this.userService.findUserByEmail(payload.email);
        const token = this.authService.login(user);
        await this.magicLinkService.sendVerificationLink(payload.email, token, '');
    }
};
exports.OnUserCreatedListener = OnUserCreatedListener;
__decorate([
    (0, event_emitter_1.OnEvent)('user.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [userCreatedEvent_1.UserCreatedEvent]),
    __metadata("design:returntype", Promise)
], OnUserCreatedListener.prototype, "handleUserCreatedEvent", null);
exports.OnUserCreatedListener = OnUserCreatedListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService,
        magic_link_service_1.MagicLinkService])
], OnUserCreatedListener);
//# sourceMappingURL=on-user-created-listener.js.map