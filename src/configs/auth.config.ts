import { IsNumber, IsString } from 'class-validator';

import { AuthConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { validateConfig } from '@src/common/utils';

class EnvironmentVariablesValidator {
  @IsString()
  JWT_SECRET: string;

  @IsNumber()
  JWT_ACCESS_TOKEN_TTL: number;
}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    secret: process.env.JWT_SECRET,
    expires: process.env.JWT_ACCESS_TOKEN_TTL
      ? parseInt(process.env.JWT_ACCESS_TOKEN_TTL, 10)
      : 2592000,
  };
});
