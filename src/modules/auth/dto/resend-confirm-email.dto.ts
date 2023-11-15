import { StringField } from '@src/decorators';

export class ResendConfirmEmailDto {
  @StringField()
  token: string;
}
