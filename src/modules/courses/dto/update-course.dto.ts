import { CreateCourseDto } from './create-course.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
