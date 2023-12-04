import { StringField } from '@src/decorators';

export class UpdateNotificationDto {
  @StringField()
  deviceType: string;
}
