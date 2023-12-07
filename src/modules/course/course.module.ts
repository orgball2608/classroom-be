import { CourseController } from './class.controller';
import { CourseService } from './course.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
