import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request } from 'express';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { RedisService } from '@src/shared/redis/redis.service';
import { TOKEN_MESSAGES } from '@src/constants/message';
import { TokenInvalidException } from '@src/exceptions';

@Injectable()
export class BlackListTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private jwtService: JwtService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader: string | undefined = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new TokenInvalidException(TOKEN_MESSAGES.TOKEN_IS_INVALID);
    }

    const payload: {
      id: number;
      tokenId: string;
      exp: number;
    } = this.jwtService.verify(token, {
      secret: this.config.get<string>('auth.accessTokenSecret'),
      ignoreExpiration: true,
    });

    if (!payload) {
      throw new TokenInvalidException(TOKEN_MESSAGES.TOKEN_IS_INVALID);
    }

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    if (payload.exp <= currentTimeInSeconds) {
      const session = await this.prisma.session.findUnique({
        where: {
          userId_tokenId: {
            userId: payload.id,
            tokenId: payload.tokenId,
          },
        },
      });

      if (session && !session.tokenDeleted) {
        await this.prisma.session.update({
          where: {
            userId_tokenId: {
              userId: payload.id,
              tokenId: payload.tokenId,
            },
          },
          data: {
            tokenDeleted: true,
            loggedOut: true,
            loggedOutAt: new Date(),
          },
        });
        next();
      } else throw new ForbiddenException();
    } else {
      const timeRemainingInSeconds = payload.exp - currentTimeInSeconds;

      const isTokenBlacklisted = await this.redis.get(token);

      if (isTokenBlacklisted) {
        await this.prisma.session.update({
          where: {
            userId_tokenId: {
              userId: payload.id,
              tokenId: payload.tokenId,
            },
          },
          data: {
            tokenDeleted: true,
            loggedOut: true,
            loggedOutAt: new Date(),
          },
        });

        throw new ForbiddenException(TOKEN_MESSAGES.TOKEN_IS_BLACKLIST);
      } else {
        const session = await this.prisma.session.findUnique({
          where: {
            userId_tokenId: {
              userId: payload.id,
              tokenId: payload.tokenId,
            },
          },
        });

        if (session && session.tokenDeleted) {
          await this.prisma.session.update({
            where: {
              userId_tokenId: {
                userId: payload.id,
                tokenId: payload.tokenId,
              },
            },
            data: {
              loggedOut: true,
              loggedOutAt: new Date(),
            },
          });
        } else {
          await this.prisma.session.update({
            where: {
              userId_tokenId: {
                userId: payload.id,
                tokenId: payload.tokenId,
              },
            },
            data: {
              tokenDeleted: true,
              loggedOut: true,
              loggedOutAt: new Date(),
            },
          });
        }

        await this.redis.set(token, 'true', timeRemainingInSeconds);

        next();
      }
    }
  }
}
