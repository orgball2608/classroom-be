import { NumberField, StringField } from '@src/decorators';

import { IsValidPercentage } from '../validators/Is-valid-percentage.validator';

export class CreateGradeCompositionDto {
  @StringField({ example: 'Grade composite 1' })
  name: string;

  @NumberField({ example: 20, minimum: 10, maximum: 100 })
  @IsValidPercentage()
  scale: number;
}
