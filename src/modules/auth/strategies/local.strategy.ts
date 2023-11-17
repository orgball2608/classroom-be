import { BadRequestException, Injectable } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { USERS_MESSAGES } from '@src/constants/message';
import { VerifyStatus } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);

    if (user.VerifyStatus != VerifyStatus.VERIFY)
      throw new BadRequestException(USERS_MESSAGES.VERIFY_TOKEN_BEFORE_LOGIN);

    return user;
  }
}
