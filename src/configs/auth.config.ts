import { IsNumber, IsString } from 'class-validator';

import { AuthConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { validateConfig } from '@src/common/utils';

class EnvironmentVariablesValidator {
  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsNumber()
  JWT_ACCESS_TOKEN_TTL: number;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsNumber()
  JWT_REFRESH_TOKEN_TTL: number;
}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
    refreshTokenExpires: process.env.JWT_REFRESH_TOKEN_TTL
      ? parseInt(process.env.JWT_REFRESH_TOKEN_TTL, 10)
      : 1800,
    accessTokenSecret: process.env.JWT_ACCESS_SECRET,
    accessTokenExpires: process.env.JWT_ACCESS_TOKEN_TTL
      ? parseInt(process.env.JWT_ACCESS_TOKEN_TTL, 10)
      : 2592000,
  };
});
