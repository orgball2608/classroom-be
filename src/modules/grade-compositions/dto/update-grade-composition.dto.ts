import { CreateGradeCompositionDto } from './create-grade-composition.dto';
import { IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class UpdateGradeCompositionDto extends PartialType(
  CreateGradeCompositionDto,
) {
  @IsOptional()
  name: string;

  @IsOptional()
  scale: number;

  @IsOptional()
  isFinalized: boolean;
}
