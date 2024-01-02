import { CreateGradeReviewDto } from './create-grade-review.dto';
import { IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class UpdateGradeReviewDto extends PartialType(CreateGradeReviewDto) {
  @IsOptional()
  expectedGrade: number;

  @IsOptional()
  explanation: string;
}
