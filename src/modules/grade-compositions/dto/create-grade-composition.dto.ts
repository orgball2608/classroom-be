import { NumberField, StringField } from '@src/decorators';

export class CreateGradeCompositionDto {
  @NumberField({ example: 1, minimum: 1 })
  courseId: number;

  @StringField({ example: 'Grade composite 1' })
  name: string;

  @NumberField({ example: 20, minimum: 0, maximum: 100 })
  scale: number;
}
