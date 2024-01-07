import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { GradeController } from './grade.controller';
import { GradeMiddleware } from '@src/middlewares';
import { GradeService } from './grade.service';
import { ROUTES } from '@src/constants';

@Module({
  controllers: [GradeController],
  providers: [GradeService],
})
export class GradeModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GradeMiddleware).forRoutes({
      path: ROUTES.GRADES,
      method: RequestMethod.ALL,
    });
  }
}
