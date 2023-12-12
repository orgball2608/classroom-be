import { NumberField } from '@src/decorators';

export class CreateNotificationDto {
  @NumberField()
  userId: number;

  @NumberField()
  title: string;

  @NumberField()
  body: string;
}
