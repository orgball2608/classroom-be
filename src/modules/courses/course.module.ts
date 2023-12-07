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

@Module({
  imports: [StorageModule],
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
  }
}
