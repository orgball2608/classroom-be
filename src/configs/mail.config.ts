import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { MailConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { validateConfig } from '@src/common/utils';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  MAIL_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  MAIL_PORT: number;

  @IsString()
  @IsOptional()
  MAIL_USERNAME: string;

  @IsString()
  @IsOptional()
  MAIL_PASSWORD: string;

  @IsString()
  @IsOptional()
  JWT_MAIL_SECRET: string;

  @IsNumber()
  @IsOptional()
  JWT_MAIL_TOKEN_TTL: number;
}

export default registerAs<MailConfig>('mailer', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    mailHost: process.env.MAIL_HOST,
    mailPort: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : 345,
    mailUsername: process.env.MAIL_USERNAME,
    mailPassword: process.env.MAIL_PASSWORD,
    jwtMailSecret: process.env.JWT_MAIL_SECRET,
    jwtMailTokenTTL: process.env.JWT_MAIL_TOKEN_TTL
      ? parseInt(process.env.JWT_MAIL_TOKEN_TTL, 10)
      : 259200,
  };
});
