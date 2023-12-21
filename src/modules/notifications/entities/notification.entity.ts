import { ApiProperty } from '@nestjs/swagger';
import { NotificationStatus } from '@prisma/client';
import { SimpleUserEntity } from '@src/common/entity/simple-user.entity';

export class Notification {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  userId: number;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  creatorId: number;

  @ApiProperty({
    type: String,
    example: 'notification title',
  })
  title: string;

  @ApiProperty({
    type: String,
    example: 'notification body',
  })
  body: string;

  @ApiProperty({
    type: String,
    example: NotificationStatus.READ,
    enum: NotificationStatus,
  })
  status: NotificationStatus;

  @ApiProperty({
    type: SimpleUserEntity,
  })
  creator: SimpleUserEntity;
}
