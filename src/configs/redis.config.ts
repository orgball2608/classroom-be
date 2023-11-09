import { IsInt, IsString, Max, Min, ValidateIf } from 'class-validator';

import { registerAs } from '@nestjs/config';
import { validateConfig } from '@src/common/utils';

class EnvironmentVariablesValidator {
  @ValidateIf((envValues) => envValues.REDIS_URL)
  @IsString()
  REDIS_URL: string;

  @ValidateIf((envValues) => !envValues.REDIS_URL)
  @IsString()
  REDIS_HOST: string;

  @ValidateIf((envValues) => !envValues.REDIS_URL)
  @IsInt()
  @Min(0)
  @Max(65535)
  REDIS_PORT: number;

  @ValidateIf((envValues) => !envValues.REDIS_URL)
  @IsString()
  REDIS_PASSWORD: string;

  @ValidateIf((envValues) => !envValues.REDIS_URL)
  @IsInt()
  @Min(1)
  REDIS_DB: number;
}

export default registerAs('redis', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10),
  };
});
