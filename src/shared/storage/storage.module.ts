import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';

import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageServiceAbstract } from './storage.abstract';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => [
        {
          ttl: configService.getOrThrow<number>('aws.awsRateTTL'),
          limit: configService.getOrThrow<number>('aws.awsRateLimit'),
        },
      ],
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: StorageServiceAbstract,
      useClass: StorageService,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [
    {
      provide: StorageServiceAbstract,
      useClass: StorageService,
    },
  ],
})
export class StorageModule {}
