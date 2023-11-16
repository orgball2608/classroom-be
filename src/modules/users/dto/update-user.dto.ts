import { OmitType, PartialType } from '@nestjs/swagger';

import { RegisterDto } from '@src/modules/auth/dto/register.dto';

export class UpdateUserDto extends OmitType(PartialType(RegisterDto), [
  'password',
  'email',
]) {}
