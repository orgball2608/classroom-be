import { NumberField, StringField } from '@src/decorators';

export class InviteEmailDto {
  @StringField({
    maxLength: 150,
    minLength: 5,
    example: 'quanghuynh@gmail.com',
  })
  email: string;

  @NumberField({
    example: 1,
  })
  courseId: number;

  @StringField({
    example: 'student',
  })
  role: string;
}
