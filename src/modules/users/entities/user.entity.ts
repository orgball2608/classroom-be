import { User, UserRole } from '@prisma/client';

import { AbstractEntity } from '@src/common/entity/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity
  extends AbstractEntity
  implements
    Omit<
      User,
      | 'password'
      | 'status'
      | 'forgotPasswordToken'
      | 'isEmailConfirmed'
      | 'verify'
    >
{
  @ApiProperty({
    type: String,
    example: 'Nguyen Van',
  })
  firstName: string;

  @ApiProperty({
    type: String,
    example: 'A',
  })
  lastName: string;

  @ApiProperty({
    type: String,
    example: 'nguyenvana@gmail.com',
  })
  email: string;

  @ApiProperty({
    example: '0123456789',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'Đà Nẵng',
  })
  address: string;

  @ApiProperty({
    type: String,
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;
}
