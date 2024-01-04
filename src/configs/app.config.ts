import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { AppConfig } from './config.type';
import { Environment } from '@src/common/enum/node-env';
import { registerAs } from '@nestjs/config';
import { validateConfig } from '@src/common/utils';

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

  @IsString()
  @IsOptional()
  FRONTEND_URL: string;

  @IsBoolean()
  @IsOptional()
  DOCUMENT_ENABLED: boolean;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    apiPrefix: process.env.API_PREFIX || 'api',
    apiVersion: process.env.API_VERSION || 'v1',
    appURL: process.env.APP_URL || 'http://localhost:3001',
    frontendURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    adminFrontendURL:
      process.env.ADMIN_FRONTEND_URL || 'http://localhost:3030/admin',
    documentEnabled: process.env.DOCUMENT_ENABLED === 'true',
  };
});
