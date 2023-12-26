import { NumberField, StringField } from '@src/decorators';

export class CreateGradeDto {
  @StringField({
    example: '2012055',
  })
  studentId: string;

  @StringField({
    example: 'Nguyễn Văn A',
  })
  fullName: string;

  @NumberField({
    example: 10,
  })
  grade: number;
}
