import { GradeCompositionMiddleware } from '@src/middlewares';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { CourseMiddleware } from '@src/middlewares/course.middleware';
import { GradeCompositionController } from './grade-composition.controller';
import { GradeCompositionService } from './grade-composition.service';
import { ROUTES } from '@src/constants';
// import { UserRole } from '@prisma/client';
import { TeacherMiddleware } from '@src/middlewares/teacher.middleware';

@Module({
  controllers: [GradeCompositionController],
  providers: [GradeCompositionService],
})
export class GradeCompositionModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(RoleChecker([UserRole.TEACHER, UserRole.ADMIN])).forRoutes(
    //   {
    //     path: 'courses/:courseId/grade-compositions',
    //     method: RequestMethod.POST,
    //   },
    //   {
    //     path: 'courses/:courseId/grade-compositions',
    //     method: RequestMethod.PATCH,
    //   },
    //   {
    //     path: 'courses/:courseId/grade-compositions/:id',
    //     method: RequestMethod.DELETE,
    //   },
    // );
    consumer.apply(CourseMiddleware).forRoutes(ROUTES.GRADE_COMPOSITIONS);
    consumer.apply(TeacherMiddleware).forRoutes(
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
      {
        path: 'courses/:courseId/grade-compositions/:id/finalize',
        method: RequestMethod.PATCH,
      },
    );

    consumer
      .apply(GradeCompositionMiddleware)
      .forRoutes('courses/:courseId/grade-compositions/:id');
  }
}
