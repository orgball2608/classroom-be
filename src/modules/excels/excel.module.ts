import { MiddlewareConsumer, Module } from '@nestjs/common';

import { CourseMiddleware } from '@src/middlewares';
import { ExcelController } from './excel.controller';
import { ExcelService } from './excel.service';

@Module({
  controllers: [ExcelController],
  providers: [ExcelService],
})
export class ExcelModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CourseMiddleware).forRoutes();
  }
}
