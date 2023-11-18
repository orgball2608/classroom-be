import { Module } from '@nestjs/common';
import { StorageServiceProvider } from './services';
import { StorageService } from './services/storage.service';

@Module({
  providers: [StorageServiceProvider, StorageService],
  exports: [StorageServiceProvider, StorageService],
})
export class StorageModule {}
