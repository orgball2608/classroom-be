import { Inject, Injectable } from '@nestjs/common';
import { RedisClient } from './redis.provider';
import { PROVIDERS } from '@src/constants';

@Injectable()
export class RedisService {
  public constructor(
    @Inject(PROVIDERS.REDIS_CLIENT)
    private readonly client: RedisClient,
  ) {}

  async set(key: string, value: any, expirationSeconds: number) {
    await this.client.set(key, value, 'EX', expirationSeconds);
  }

  async get(key: string): Promise<any | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.client.expire(key, seconds);
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return await this.client.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return await this.client.hget(key, field);
  }
}
