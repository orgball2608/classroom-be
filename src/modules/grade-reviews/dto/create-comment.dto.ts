import { StringField } from '@src/decorators';

export class CreateCommentDto {
  @StringField({
    example: 'day la comment',
  })
  body: string;

  @StringField({
    example: '20120123',
  })
  studentId: string;
}
