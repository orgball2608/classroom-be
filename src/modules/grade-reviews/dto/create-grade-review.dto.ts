import { NumberField, StringFieldOptional } from '@src/decorators';

export class CreateGradeReviewDto {
  @NumberField({
    example: 1,
  })
  expectedGrade: number;

  @StringFieldOptional({
    example: 'Lý do',
  })
  explanation: string;
}
