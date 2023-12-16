import { GradeCompositionController } from './grade-composition.controller';
import { GradeCompositionService } from './grade-composition.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [GradeCompositionController],
  providers: [GradeCompositionService],
})
export class GradeCompositionModule {}
