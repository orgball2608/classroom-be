import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { CourseMiddleware } from '@src/middlewares';
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
    );
  }
}
