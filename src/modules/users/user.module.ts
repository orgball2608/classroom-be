import { AuthModule } from '../auth/auth.module';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { StorageModule } from '@src/shared/storage/storage.module';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
