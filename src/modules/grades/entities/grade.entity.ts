import { AbstractEntity } from '@src/common/entity/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';
import { SimpleUserEntity } from '@src/common/entity/simple-user.entity';

export class Grade extends AbstractEntity {
  @ApiProperty({
    example: 20120557,
  })
  studentId: number;

  @ApiProperty({
    example: 'Nguyễn Văn A',
  })
  studentName: string;

  @ApiProperty({
    example: 1,
  })
  createdBy: SimpleUserEntity;

  @ApiProperty({
    example: 8.5,
  })
  grade: number;
}
