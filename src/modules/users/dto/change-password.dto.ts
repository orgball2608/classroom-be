import { PasswordField } from '@src/decorators';

export class ChangePasswordDto {
  @PasswordField({ example: 'password' })
  oldPassword: string;

  @PasswordField({ example: 'newpassword' })
  newPassword: string;

  @PasswordField({ example: 'newpassword' })
  confirmPassword: string;
}
