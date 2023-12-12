import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';

import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { StorageServiceProvider } from './services';

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
    StorageServiceProvider,
    StorageService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [StorageServiceProvider, StorageService],
})
export class StorageModule {}
