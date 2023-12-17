import { NumberField, StringField } from '@src/decorators';

export class CreateGradeCompositionDto {
  @StringField({ example: 'Grade composite 1' })
  name: string;

  @NumberField({ example: 20, minimum: 0, maximum: 100 })
  scale: number;
}
