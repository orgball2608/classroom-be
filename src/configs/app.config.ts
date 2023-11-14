import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { AppConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { validateConfig } from '@src/common/utils';

enum Environment {
  Development = 'development',
  Production = 'production',
}

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  PORT: number;

  @IsString()
  @IsOptional()
  API_PREFIX: string;

  @IsString()
  @IsOptional()
  API_VERSION: string;

  @IsString()
  @IsOptional()
  APP_URL: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT
      ? parseInt(process.env.APP_PORT, 10)
      : process.env.PORT
        ? parseInt(process.env.PORT, 10)
        : 3000,
    apiPrefix: process.env.API_PREFIX || 'api',
    apiVersion: process.env.API_VERSION || 'v1',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
  };
});
