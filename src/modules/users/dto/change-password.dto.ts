import { StringField } from '@src/decorators';

export class ChangePasswordDto {
  @StringField()
  oldPassword: string;

  @StringField()
  newPassword: string;

  @StringField()
  confirmPassword: string;
}
