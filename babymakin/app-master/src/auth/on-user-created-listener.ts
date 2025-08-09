import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from 'src/core/events/userCreatedEvent';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { MagicLinkService } from './magic-link-service';

@Injectable()
export class OnUserCreatedListener {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private magicLinkService: MagicLinkService,
  ) {}
  @OnEvent('user.created')
  async handleUserCreatedEvent(payload: UserCreatedEvent) {
    const user = await this.userService.findUserByEmail(payload.email);
    const token = this.authService.login(user);
    await this.magicLinkService.sendVerificationLink(payload.email, token, '');
  }
}
