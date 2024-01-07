import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { CourseMiddleware, GradeMiddleware } from '@src/middlewares';
import { GradeReviewController } from './grade-review.controller';
import { GradeReviewService } from './grade-review.service';
import { ROUTES } from '@src/constants';

@Module({
  controllers: [GradeReviewController],
  providers: [GradeReviewService],
})
export class GradeReviewModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CourseMiddleware).forRoutes(ROUTES.GRADE_REVIEWS);
    consumer
      .apply(GradeMiddleware)
      .exclude({
        path: ROUTES.GRADE_REVIEWS + '/list',
        method: RequestMethod.GET,
      })
      .forRoutes({
        path:
          ROUTES.GRADE_REVIEWS +
          '/grade-compositions/:compositionId/grades/:gradeId',
        method: RequestMethod.ALL,
      });
  }
}
