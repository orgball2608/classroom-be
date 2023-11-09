import {
  BooleanFieldOptional,
  EmailFieldOptional,
  PhoneField,
  StringField,
  StringFieldOptional,
} from '@src/decorators';

export class RegisterDto {
  @StringFieldOptional({
    example: 'Nguyễn Văn A',
  })
  name?: string;

  @StringField({
    example: 'user',
  })
  username!: string;

  @StringField({
    minLength: 6,
    example: 'password',
  })
  password!: string;

  @BooleanFieldOptional({
    example: true,
  })
  status?: boolean;

  @EmailFieldOptional({
    example: 'nguyenvana@gmail.com',
  })
  email?: string;

  @PhoneField({
    example: '0123456789',
  })
  phoneNumber!: string;

  @StringField({
    example: 'Đà Nẵng',
  })
  address!: string;
}
