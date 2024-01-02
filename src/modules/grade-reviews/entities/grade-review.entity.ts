import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractEntity } from '@src/common/entity/abstract.entity';
import { SimpleUserEntity } from '@src/common/entity/simple-user.entity';

export class GradeReview extends AbstractEntity {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  gradeId: number;

  @ApiProperty({
    type: Number,
    example: 10,
  })
  expectedGrade: number;

  @ApiPropertyOptional({
    type: String,
    example: 'Lý do',
  })
  explanation: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  isResolve: boolean;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  createdById: number;

  @ApiProperty({ type: SimpleUserEntity })
  createdBy: SimpleUserEntity;
}
