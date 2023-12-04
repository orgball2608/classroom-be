import { StringField } from '@src/decorators';

export class CreateNotificationDto {
  @StringField()
  notificationToken: string;

  @StringField()
  deviceType: string;
}
