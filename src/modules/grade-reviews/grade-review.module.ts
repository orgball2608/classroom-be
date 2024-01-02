import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { GradeMiddleware } from '@src/middlewares';
import { GradeReviewController } from './grade-review.controller';
import { GradeReviewService } from './grade-review.service';
import { ROUTES } from '@src/constants';

@Module({
  controllers: [GradeReviewController],
  providers: [GradeReviewService],
})
export class GradeReviewModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GradeMiddleware).forRoutes({
      path: ROUTES.GRADE_REVIEWS,
      method: RequestMethod.ALL,
    });
  }
}
