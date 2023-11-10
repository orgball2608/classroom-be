import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import {
  TOKEN_IS_BLACKLIST,
  TOKEN_IS_EXPIRED,
  USER_LOGGED_OUT,
} from '@src/errors/errors.constant';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { RedisService } from '@src/shared/redis/redis.service';

@Injectable()
export class AuthenticateTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private jwtService: JwtService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new ForbiddenException();
    }

    const isTokenBlacklisted = await this.redis.get(token);

    if (isTokenBlacklisted) {
      throw new ForbiddenException({
        TOKEN_IS_BLACKLIST,
      });
    } else {
      const payload: {
        id: number;
        tokenId: string;
        exp: number;
      } = this.jwtService.verify(token, {
        secret: this.config.get<string>('auth.accessTokenSecret'),
        ignoreExpiration: true,
      });

      if (!payload) {
        throw new ForbiddenException();
      }

      const currentTimeInSeconds = Math.floor(Date.now() / 1000);

      if (payload.exp <= currentTimeInSeconds) {
        throw new UnauthorizedException(TOKEN_IS_EXPIRED);
      }

      const timeRemainingInSeconds = payload.exp - currentTimeInSeconds;

      const session = await this.prisma.session.findUnique({
        where: {
          userId_tokenId: {
            userId: payload.id,
            tokenId: payload.tokenId,
          },
        },
      });

      if (session && session.tokenDeleted) {
        await this.redis.set(token, 'true', timeRemainingInSeconds);
        throw new UnauthorizedException(USER_LOGGED_OUT);
      }

      req.user = payload;
      next();
    }
  }
}
