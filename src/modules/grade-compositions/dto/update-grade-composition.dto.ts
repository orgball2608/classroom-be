import { CreateGradeCompositionDto } from './create-grade-composition.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateGradeCompositionDto extends PartialType(
  CreateGradeCompositionDto,
) {}
