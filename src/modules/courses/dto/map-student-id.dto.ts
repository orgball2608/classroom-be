import { StringField } from '@src/decorators';

export class MapStudentIdWithUserIdDto {
  @StringField({
    example: '20120555',
  })
  studentId: string;
}
