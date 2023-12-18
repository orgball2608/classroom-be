import { NumberField } from '@src/decorators';

export class CreateGradeDto {
  @NumberField({
    example: 2012055,
  })
  studentId: number;

  @NumberField({
    example: 10,
  })
  grade: number;
}
