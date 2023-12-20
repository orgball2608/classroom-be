import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { RoleChecker } from '@src/middlewares';
import { StorageModule } from '@src/shared/storage/storage.module';
import { UserController } from './user.controller';
import { UserRole } from '@prisma/client';
import { UserService } from './user.service';

@Module({
  imports: [AuthModule, StorageModule, JwtModule.register({})],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RoleChecker([UserRole.ADMIN])).forRoutes(
      { path: 'users', method: RequestMethod.GET },
      {
        path: 'users/:id',
        method: RequestMethod.DELETE,
      },
      {
        path: 'users/:id',
        method: RequestMethod.PATCH,
      },
    );
  }
}
