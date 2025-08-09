import { Controller, Post, Body, UnauthorizedException, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { MagicLinkService } from './magic-link-service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private magicLinkService: MagicLinkService,
  ) {}

  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Req() request: Request) {
    const user = await this.userService.findUserByEmail(loginDto.email);
    if (user == null || user.inactive) {
      throw new UnauthorizedException();
    }

    const origin = request.headers.origin ? request.headers.origin : '';
    const token = this.authService.login(user);
    this.magicLinkService.sendVerificationLink(loginDto.email, token, origin);
    return;
  }
}
