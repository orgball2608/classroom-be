import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { CourseController } from './course.controller';
import { CourseMiddleware } from '@src/middlewares/course.middleware';
import { CourseService } from './course.service';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mails/mail.module';
import { RoleChecker } from '@src/middlewares/role-checker.middleware';
import { StorageService } from '@src/shared/storage/storage.service';
import { StorageServiceAbstract } from '@src/shared/storage/storage.abstract';
import { UserRole } from '@prisma/client';

@Module({
  imports: [JwtModule.register({}), MailModule],
  controllers: [CourseController],
  providers: [
    CourseService,
    {
      provide: StorageServiceAbstract,
      useClass: StorageService,
    },
  ],
})
export class CourseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RoleChecker([UserRole.ADMIN])).forRoutes(
      { path: 'courses', method: RequestMethod.GET },
      {
        path: 'course/:ids',
        method: RequestMethod.DELETE,
      },
      {
        path: 'course/:courseId/lock',
        method: RequestMethod.PATCH,
      },
      {
        path: 'course/:courseId/un-lock',
        method: RequestMethod.PATCH,
      },
    );

    consumer
      .apply(CourseMiddleware)
      .exclude({
        path: 'courses/my-courses',
        method: RequestMethod.GET,
      })
      .forRoutes(
        {
          path: 'courses/:id',
          method: RequestMethod.GET,
        },
        {
          path: 'courses/:id/users',
          method: RequestMethod.GET,
        },
        {
          path: 'courses/enrollment-status/:id',
          method: RequestMethod.GET,
        },
        {
          path: 'courses/:id/enroll',
          method: RequestMethod.PATCH,
        },
        {
          path: 'courses/:id',
          method: RequestMethod.PATCH,
        },
        {
          path: 'courses/:id/users/:userId',
          method: RequestMethod.DELETE,
        },
        {
          path: 'courses/:id/enrollments/me/leave',
          method: RequestMethod.DELETE,
        },
      );
  }
}
