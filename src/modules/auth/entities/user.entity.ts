import { ApiProperty } from '@nestjs/swagger';
import { AbstractEntity } from '@src/common/entity/abstract.entity';

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
  username: string;
}
