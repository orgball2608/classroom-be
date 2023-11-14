import { BadRequestException, Injectable } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { USERS_MESSAGES } from '@src/constants/message';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);

    if (!user.isEmailConfirmed)
      throw new BadRequestException(USERS_MESSAGES.VERIFY_TOKEN_BEFORE_LOGIN);

    return user;
  }
}
