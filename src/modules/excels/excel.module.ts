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
        path: 'courses/:courseId/excels/enrollments/download',
        method: RequestMethod.GET,
      },
      {
        path: 'courses/:courseId/excels/enrollments/upload',
        method: RequestMethod.POST,
      },
    );
  }
}
