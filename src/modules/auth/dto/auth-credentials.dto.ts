import { EmailField, PasswordField } from '@src/decorators';

export class AuthCredentialsDto {
  @EmailField({
    example: 'quanghuynh@gmail.com',
  })
  email!: string;

  @PasswordField({
    example: 'password',
  })
  password!: string;
}
