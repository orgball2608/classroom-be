import { AuthenticateMiddleware, RoleChecker } from '@src/middlewares';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
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
    consumer
      .apply(AuthenticateMiddleware)
      .exclude(
        '/users/forgot-password',
        '/users/verify-forgot-password',
        '/users/reset-password',
      );

    consumer
      .apply(RoleChecker([UserRole.ADMIN]))
      .exclude({
        path: 'users/student-id',
        method: RequestMethod.PATCH,
      })
      .forRoutes(
        { path: 'users', method: RequestMethod.GET },
        {
          path: 'users/:id',
          method: RequestMethod.DELETE,
        },
        {
          path: 'users/:id',
          method: RequestMethod.PATCH,
        },
        {
          path: 'users/:id/student-id',
          method: RequestMethod.PATCH,
        },
        {
          path: 'users/student-id',
          method: RequestMethod.DELETE,
        },
      );
  }
}
