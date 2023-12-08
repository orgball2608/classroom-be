import { StringField, StringFieldOptional } from '@src/decorators';

export class CreateCourseDto {
  @StringField({
    maxLength: 50,
    minLength: 3,
    example: 'PTUDWEBNC-01',
  })
  name: string;

  @StringFieldOptional({
    example: 'Đây là môn học về phát triển ứng dụng web nâng cao',
  })
  description: string;

  @StringFieldOptional({
    example: '101',
  })
  room: string;

  @StringFieldOptional({
    example: 'Tin học',
  })
  topic: string;
}
