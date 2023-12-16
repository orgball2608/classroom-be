import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthenticateMiddleware } from '@src/middlewares';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from '@src/shared/redis/redis.module';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({}), RedisModule],
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
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticateMiddleware)
      .forRoutes('/auth/me', '/auth/logout');
  }
}
