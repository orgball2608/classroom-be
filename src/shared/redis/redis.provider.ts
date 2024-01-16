import { ConfigService } from '@nestjs/config';
import { PROVIDERS } from '@src/constants';
import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export type RedisClient = Redis;

export const RedisProvider: Provider = {
  useFactory: (configService: ConfigService): RedisClient => {
    return new Redis(configService.getOrThrow<string>('redis.url'));
  },
  provide: PROVIDERS.REDIS_CLIENT,
  inject: [ConfigService],
};
