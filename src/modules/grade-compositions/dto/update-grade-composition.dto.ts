import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateGradeCompositionDto } from './create-grade-composition.dto';
import { IsOptional } from 'class-validator';

export class UpdateGradeCompositionDto extends PartialType(
  OmitType(CreateGradeCompositionDto, ['courseId'] as const),
) {
  @IsOptional()
  name: string;

  @IsOptional()
  scale: number;
}
