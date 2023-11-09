import { ApiProperty } from '@nestjs/swagger';

export class AbstractEntity {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: Date,
    example: new Date('2023-09-16'),
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    example: new Date('2023-09-16'),
  })
  updatedAt: Date;
}
