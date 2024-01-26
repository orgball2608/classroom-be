import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { MailModule } from '../mails/mail.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from '@src/shared/redis/redis.module';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({}), RedisModule, MailModule],
  providers: [
    LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    FacebookStrategy,
    GoogleStrategy,
    AuthService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
