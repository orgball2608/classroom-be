import { NumberField, StringField } from '@src/decorators';

export class UpdateGradeDto {
  @StringField({
    example: '2012055',
  })
  studentId: string;

  @NumberField({
    example: 10,
    min: 0,
    max: 10,
  })
  grade: number;
}
