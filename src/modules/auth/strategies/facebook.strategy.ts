import { Profile, Strategy } from 'passport-facebook';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('auth.facebookClientID'),
      clientSecret: configService.get<string>('auth.facebookClientSecret'),
      callbackURL: configService.get<string>('auth.facebookCallbackURL'),
      scope: 'email',
      profileFields: ['id', , 'emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    return { profile };
  }
}
