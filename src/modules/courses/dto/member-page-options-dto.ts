import { StringFieldOptional } from '@src/decorators';

export class MemberPageOptionsDTO {
  @StringFieldOptional()
  search?: string;
}
