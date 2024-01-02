import {
  CourseMiddleware,
  GradeCompositionMiddleware,
  TeacherMiddleware,
} from '@src/middlewares';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { ExcelController } from './excel.controller';
import { ExcelService } from './excel.service';

@Module({
  controllers: [ExcelController],
  providers: [ExcelService],
})
export class ExcelModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CourseMiddleware).forRoutes(
      {
        path: 'excels/courses/:courseId/students/upload',
        method: RequestMethod.POST,
      },
      {
        path: 'excels/courses/:courseId/grades-template/download',
        method: RequestMethod.GET,
      },
      {
        path: 'excels/courses/:courseId/grade-compositions/:id/grades/upload',
        method: RequestMethod.POST,
      },
      {
        path: 'excels/courses/:courseId/grade-board/download',
        method: RequestMethod.GET,
      },
    );

    consumer.apply(TeacherMiddleware).forRoutes(
      {
        path: 'excels/courses/:courseId/students/upload',
        method: RequestMethod.POST,
      },
      {
        path: 'excels/courses/:courseId/grade-compositions/:id/grades/upload',
        method: RequestMethod.POST,
      },
    );

    consumer.apply(GradeCompositionMiddleware).forRoutes({
      path: 'excels/courses/:courseId/grade-compositions/:id/grades/upload',
      method: RequestMethod.POST,
    });
  }
}
