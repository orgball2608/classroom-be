import { OmitType, PartialType } from '@nestjs/swagger';

import { IsOptional } from 'class-validator';
import { RegisterDto } from '@src/modules/auth/dto/register.dto';
import { Sex } from '@prisma/client';
import { StringFieldOptional } from '@src/decorators';

export class UpdateUserDto extends PartialType(
  OmitType(RegisterDto, ['email', 'password']),
) {
  @IsOptional()
  studentId: string;

  @IsOptional()
  firstName: string;

  @IsOptional()
  lastName: string;

  @IsOptional()
  email: string;

  @IsOptional()
  password: string;

  @IsOptional()
  phoneNumber!: string;

  @IsOptional()
  address: string;

  @StringFieldOptional({
    enum: Sex,
  })
  sex: Sex;
}
