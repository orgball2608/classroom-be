import { PasswordField, StringField } from '@src/decorators';

export class ResetPasswordDto {
  @StringField()
  token: string;

  @PasswordField()
  password: string;
}
