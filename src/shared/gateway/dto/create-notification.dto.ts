import { NumberField, NumberFieldOptional } from '@src/decorators';

export class CreateNotificationDto {
  @NumberField()
  userId: number;

  @NumberFieldOptional()
  creatorId: number;

  @NumberField()
  title: string;

  @NumberField()
  body: string;
}
