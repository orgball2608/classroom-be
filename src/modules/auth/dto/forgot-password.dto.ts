import { EmailField } from '@src/decorators';

export class ForgotPasswordDto {
  @EmailField()
  email: string;
}
