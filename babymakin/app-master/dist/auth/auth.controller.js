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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const magic_link_service_1 = require("./magic-link-service");
let AuthController = class AuthController {
    constructor(authService, userService, magicLinkService) {
        this.authService = authService;
        this.userService = userService;
        this.magicLinkService = magicLinkService;
    }
    async login(loginDto, request) {
        const user = await this.userService.findUserByEmail(loginDto.email);
        if (user == null || user.inactive) {
            throw new common_1.UnauthorizedException();
        }
        const origin = request.headers.origin ? request.headers.origin : '';
        const token = this.authService.login(user);
        this.magicLinkService.sendVerificationLink(loginDto.email, token, origin);
        return;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('/login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService,
        magic_link_service_1.MagicLinkService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map