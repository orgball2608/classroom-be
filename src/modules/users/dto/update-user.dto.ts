import { NumberFieldOptional, StringFieldOptional } from '@src/decorators';
import { OmitType, PartialType } from '@nestjs/swagger';

import { IsOptional } from 'class-validator';
import { RegisterDto } from '@src/modules/auth/dto/register.dto';
import { Sex } from '@prisma/client';

export class UpdateUserDto extends PartialType(
  OmitType(RegisterDto, ['email', 'password']),
) {
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

  @NumberFieldOptional({
    example: 2012055,
  })
  studentId: number;

  @StringFieldOptional({
    enum: Sex,
  })
  sex: Sex;
}
