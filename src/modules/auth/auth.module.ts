import {
  AuthenticateTokenMiddleware,
  BlackListTokenMiddleware,
} from '@src/middlewares';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisModule } from '@src/shared/redis/redis.module';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({}), RedisModule],
  providers: [
    PrismaService,
    AuthService,
    LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    FacebookStrategy,
    ConfigService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BlackListTokenMiddleware).forRoutes('/auth/logout');
    consumer.apply(AuthenticateTokenMiddleware).forRoutes('/auth/me');
  }
}
