import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { CourseController } from './class.controller';
import { CourseService } from './course.service';
import { RoleChecker } from '@src/middlewares/role-checker.middleware';
import { StorageModule } from '@src/shared/storage/storage.module';
import { UserRole } from '@prisma/client';
import { CourseMiddleware } from '@src/middlewares/course.middleware';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [StorageModule, JwtModule.register({})],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RoleChecker([UserRole.ADMIN])).forRoutes(
      { path: 'courses', method: RequestMethod.GET },
      {
        path: 'courses/:id',
        method: RequestMethod.DELETE,
      },
    );

    consumer.apply(CourseMiddleware).forRoutes(
      {
        path: 'courses/:id',
        method: RequestMethod.GET,
      },
      {
        path: 'courses/:id/users',
        method: RequestMethod.GET,
      },
      {
        path: 'courses/checkEnrolled/:id',
        method: RequestMethod.GET,
      },
      {
        path: 'courses/:id/enroll',
        method: RequestMethod.PATCH,
      },
    );
  }
}
