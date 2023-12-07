import { CourseController } from './class.controller';
import { CourseService } from './course.service';
import { Module } from '@nestjs/common';
import { StorageModule } from '@src/shared/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
