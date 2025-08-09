import { UserCreatedEvent } from 'src/core/events/userCreatedEvent';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { MagicLinkService } from './magic-link-service';
export declare class OnUserCreatedListener {
    private authService;
    private userService;
    private magicLinkService;
    constructor(authService: AuthService, userService: UserService, magicLinkService: MagicLinkService);
    handleUserCreatedEvent(payload: UserCreatedEvent): Promise<void>;
}
