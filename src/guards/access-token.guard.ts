import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TOKEN_MESSAGES, USERS_MESSAGES } from '@src/constants';

import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '@src/decorators';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { TokenInvalidException } from '@src/exceptions';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(
    private readonly config: ConfigService,
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {
    super();
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('Access token guard');
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new TokenInvalidException(TOKEN_MESSAGES.TOKEN_IS_INVALID);
    }

    try {
      const payload: {
        id: number;
        exp: number;
      } = this.jwtService.verify(token, {
        secret: this.config.getOrThrow<string>('auth.accessTokenSecret'),
        ignoreExpiration: true,
      });

      console.log('payload', payload);

      if (!payload) {
        throw new TokenInvalidException(TOKEN_MESSAGES.TOKEN_IS_INVALID);
      }

      const currentTimeInSeconds = Math.floor(Date.now() / 1000);

      if (payload.exp <= currentTimeInSeconds) {
        throw new UnauthorizedException(TOKEN_MESSAGES.TOKEN_IS_EXPIRED);
      }
    } catch (error) {
      throw new TokenInvalidException(TOKEN_MESSAGES.TOKEN_IS_INVALID);
    }

    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException(USERS_MESSAGES.USER_NOT_FOUND);
    }

    if (user.deleted === true) {
      throw new BadRequestException(USERS_MESSAGES.USER_IS_BANNED);
    }

    return user;
  }
}
