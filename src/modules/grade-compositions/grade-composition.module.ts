import { MiddlewareConsumer, Module } from '@nestjs/common';

import { GradeCompositionController } from './grade-composition.controller';
import { GradeCompositionMiddleware } from '@src/middlewares';
import { GradeCompositionService } from './grade-composition.service';

@Module({
  controllers: [GradeCompositionController],
  providers: [GradeCompositionService],
})
export class GradeCompositionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GradeCompositionMiddleware).forRoutes('grade-compositions');
  }
}
