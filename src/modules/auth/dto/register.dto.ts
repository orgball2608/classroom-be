import { EmailField, PasswordField, StringField } from '@src/decorators';

export class RegisterDto {
  @StringField({
    example: 'Nguyễn',
  })
  firstName!: string;

  @StringField({
    example: 'Văn A',
  })
  lastName!: string;

  @EmailField({
    example: 'quanghuynh@gmail.com',
  })
  email: string;

  @PasswordField({
    example: 'password',
  })
  password: string;

  @StringField({
    example: '0796694097',
  })
  phoneNumber!: string;

  @StringField({
    example: 'Đà Nẵng',
  })
  address: string;
}
