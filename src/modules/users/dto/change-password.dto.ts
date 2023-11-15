import { StringField } from '@src/decorators';

export class ChangePasswordDto {
  @StringField({ minLength: 6, maxLength: 20 })
  oldPassword: string;

  @StringField({ minLength: 6, maxLength: 20 })
  newPassword: string;

  @StringField({ minLength: 6, maxLength: 20 })
  confirmPassword: string;
}
