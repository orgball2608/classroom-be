import { UserRole, VerifyStatus } from '@prisma/client';

import { PartialType } from '@nestjs/swagger';
import { StringFieldOptional } from '@src/decorators';
import { UpdateUserDto } from './update-user.dto';

export class UpdateFullFieldUserDto extends PartialType(UpdateUserDto) {
  @StringFieldOptional({
    enum: UserRole,
  })
  role: UserRole;

  @StringFieldOptional()
  password: string;

  @StringFieldOptional({
    enum: VerifyStatus,
  })
  verify: VerifyStatus;
}
