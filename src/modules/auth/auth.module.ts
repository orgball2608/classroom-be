import {
  AuthenticateTokenMiddleware,
  BlackListTokenMiddleware,
} from '@src/middlewares';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt-auth.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisModule } from '@src/shared/redis/redis.module';

@Module({
  providers: [
    PrismaService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    ConfigService,
  ],
  imports: [PassportModule, JwtModule.register({}), RedisModule],
  controllers: [AuthController],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BlackListTokenMiddleware).forRoutes('/auth/logout');
    consumer.apply(AuthenticateTokenMiddleware).forRoutes('/auth/me');
  }
}
