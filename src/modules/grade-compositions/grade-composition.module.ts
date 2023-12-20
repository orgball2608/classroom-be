import { GradeCompositionMiddleware, RoleChecker } from '@src/middlewares';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { CourseMiddleware } from '@src/middlewares/course.middleware';
import { GradeCompositionController } from './grade-composition.controller';
import { GradeCompositionService } from './grade-composition.service';
import { UserRole } from '@prisma/client';

@Module({
  controllers: [GradeCompositionController],
  providers: [GradeCompositionService],
})
export class GradeCompositionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RoleChecker([UserRole.TEACHER, UserRole.ADMIN])).forRoutes(
      {
        path: 'courses/:courseId/grade-compositions',
        method: RequestMethod.POST,
      },
      {
        path: 'courses/:courseId/grade-compositions',
        method: RequestMethod.PATCH,
      },
      {
        path: 'courses/:courseId/grade-compositions/:id',
        method: RequestMethod.DELETE,
      },
    );

    consumer
      .apply(CourseMiddleware)
      .forRoutes('courses/:courseId/grade-compositions');

    consumer
      .apply(GradeCompositionMiddleware)
      .forRoutes('courses/:courseId/grade-compositions/:id');
  }
}
