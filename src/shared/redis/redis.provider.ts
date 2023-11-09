import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export type RedisClient = Redis;

export const RedisProvider: Provider = {
  useFactory: (configService: ConfigService): RedisClient => {
    return new Redis(configService.get<string>('redis.url'));
  },
  provide: 'REDIS_CLIENT',
  inject: [ConfigService],
};
