import { StringField } from '@src/decorators';

export class ResendConfirmEmailDto {
  @StringField()
  email: string;
}
