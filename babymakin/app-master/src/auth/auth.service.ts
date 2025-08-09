import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(user: any): string {
    const payload = {
      sub: user.id,
      version: '1.0.2',
    };
    return this.jwtService.sign(payload);
  }
}
