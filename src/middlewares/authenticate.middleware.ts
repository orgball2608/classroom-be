import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { TOKEN_MESSAGES, USERS_MESSAGES } from '@src/constants/message';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { TokenInvalidException } from '@src/exceptions';

@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private jwtService: JwtService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new TokenInvalidException(TOKEN_MESSAGES.TOKEN_IS_INVALID);
    }

    const payload: {
      id: number;
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
      throw new UnauthorizedException(TOKEN_MESSAGES.TOKEN_IS_EXPIRED);
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!user) {
      throw new BadRequestException(USERS_MESSAGES.USER_NOT_FOUND);
    }

    if (user.deleted === true) {
      throw new BadRequestException(USERS_MESSAGES.USER_IS_BANNED);
    }

    req.user = user;
    next();
  }
}
