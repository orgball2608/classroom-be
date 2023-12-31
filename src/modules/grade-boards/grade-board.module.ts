import { MiddlewareConsumer, Module } from '@nestjs/common';

import { CourseMiddleware } from '@src/middlewares';
import { GradeBoardController } from './grade-board.controller';
import { GradeBoardService } from './grade-board.service';

@Module({
  controllers: [GradeBoardController],
  providers: [GradeBoardService],
})
export class GradeBoardModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CourseMiddleware)
      .forRoutes('courses/:courseId/grade-boards');
  }
}
