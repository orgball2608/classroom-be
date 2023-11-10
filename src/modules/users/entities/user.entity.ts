import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User, UserRole } from '@prisma/client';

import { AbstractEntity } from '@src/common/entity/abstract.entity';

export class UserEntity
  extends AbstractEntity
  implements Omit<User, 'password'>
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
    type: Boolean,
    example: true,
  })
  status: boolean;

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

  @ApiPropertyOptional({
    example: '',
  })
  resetPasswordToken: string;

  @ApiPropertyOptional({
    example: '',
  })
  resetPasswordExpires: Date;
}
