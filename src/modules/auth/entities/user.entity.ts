import { AbstractEntity } from '@src/common/entity/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity extends AbstractEntity {
  @ApiProperty({
    type: String,
    example: 'Administrator',
  })
  name: string;

  @ApiProperty({
    type: String,
    example: 'admin',
  })
  string: string;
}
