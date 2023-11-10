import { EmailField, StringField } from '@src/decorators';

export class AuthCredentialsDto {
  @EmailField({
    example: 'quanghuynh@gmail.com',
  })
  email!: string;

  @StringField({
    minLength: 6,
    example: 'password',
  })
  password!: string;
}
