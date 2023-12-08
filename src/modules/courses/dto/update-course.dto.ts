import { CreateCourseDto } from './create-course.dto';
import { IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @IsOptional()
  name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  room: string;

  @IsOptional()
  topic: string;
}
