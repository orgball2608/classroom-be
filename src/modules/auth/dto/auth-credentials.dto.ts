import { StringField } from '@src/decorators';

export class AuthCredentialsDto {
  @StringField({
    example: 'admin',
  })
  username!: string;

  @StringField({
    minLength: 6,
    example: 'password',
  })
  password!: string;
}
