import { GradeCompositionMiddleware, GradeMiddleware } from '@src/middlewares';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { GradeController } from './grade.controller';
import { GradeService } from './grade.service';

@Module({
  controllers: [GradeController],
  providers: [GradeService],
})
export class GradeModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GradeCompositionMiddleware).forRoutes({
      path: 'courses/:courseId/grade-compositions/:compositionId',
      method: RequestMethod.ALL,
    });

    consumer.apply(GradeMiddleware).forRoutes({
      path: 'courses/:courseId/grade-compositions/:compositionId/grades',
      method: RequestMethod.ALL,
    });
  }
}
