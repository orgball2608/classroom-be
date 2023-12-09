import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractEntity } from '@src/common/entity/abstract.entity';
import { SimpleUserEntity } from '@src/common/entity/simple-user.entity';

export class Course extends AbstractEntity {
  @ApiProperty({
    type: String,
    example: 'Course 1',
  })
  name: string;

  @ApiPropertyOptional({
    type: String,
    example: 'https://example.com/avatar.png',
  })
  avatar: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Course 1 description',
  })
  description: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Room 1',
  })
  room: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Topic 1',
  })
  topic: string;

  @ApiProperty({
    type: String,
    example: 'ABC123',
  })
  code: string;

  @ApiProperty({
    type: Number,
    example: 2022,
  })
  year: number;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  createdById: number;

  @ApiProperty({
    type: SimpleUserEntity,
  })
  createdBy: SimpleUserEntity;
}
