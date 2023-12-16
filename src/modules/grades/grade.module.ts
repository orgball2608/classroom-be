import { GradeController } from './grade.controller';
import { GradeService } from './grade.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [GradeController],
  providers: [GradeService],
})
export class GradeModule {}
