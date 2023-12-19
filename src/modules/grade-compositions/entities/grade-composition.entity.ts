import { AbstractEntity } from '@src/common/entity/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({
    type: Boolean,
    example: true,
  })
  deleted: boolean;
}
