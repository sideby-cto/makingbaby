import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
// import { LocalStrategy } from './local-strategy.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { EmailService } from './email-service';
import { MagicLinkService } from './magic-link-service';
import { ConfigModule } from '@nestjs/config';
import { OnUserCreatedListener } from './on-user-created-listener';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: '@ek~=I*<zP}i/jpTO|1NH6m4}A&X/>t',
      signOptions: { expiresIn: '400d' },
    }),
  ],
  providers: [
    AuthService,
    // LocalStrategy,
    JwtStrategy,
    EmailService,
    MagicLinkService,
    OnUserCreatedListener,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
