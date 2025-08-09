import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { MagicLinkService } from './magic-link-service';
export declare class AuthController {
    private authService;
    private userService;
    private magicLinkService;
    constructor(authService: AuthService, userService: UserService, magicLinkService: MagicLinkService);
    login(loginDto: LoginDto, request: Request): Promise<void>;
}
