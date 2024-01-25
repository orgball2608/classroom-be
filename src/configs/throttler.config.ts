import { IsInt, IsOptional, IsString } from 'class-validator';

import { ThrottlerConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { validateConfig } from '@src/common/utils';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  THROTTLER_TTL: string;

  @IsInt()
  @IsOptional()
  THROTTLER_LIMIT: number;
}

export default registerAs<ThrottlerConfig>('throttler', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    ttl: process.env.THROTTLER_TTL,
    limit: process.env.THROTTLER_LIMIT
      ? parseInt(process.env.THROTTLER_LIMIT, 10)
      : 100,
  };
});
