import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractEntity } from '@src/common/entity/abstract.entity';
import { SimpleUserEntity } from '@src/common/entity/simple-user.entity';

export class GradeCompositionEntity extends AbstractEntity {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  courseId: number;

  @ApiProperty({
    type: String,
    example: 'Midterm',
  })
  name: string;

  @ApiProperty({
    type: Number,
    example: 50,
  })
  scale: number;

  @ApiPropertyOptional({
    type: SimpleUserEntity,
  })
  createdBy?: SimpleUserEntity;
}
