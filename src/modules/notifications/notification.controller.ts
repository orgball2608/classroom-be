import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common';

import { NotificationService } from './notification.service';
import { IUserRequest } from '@src/interfaces';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAllByUserId(@Req() req: IUserRequest) {
    return this.notificationService.findAllByUserId(req.user.id);
  }

  @Get(':id')
  findOne(
    @Req() req: IUserRequest,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    return this.notificationService.findOne(req.user.id, notificationId);
  }

  @Get(':id/mark-as-read')
  markAsRead(
    @Req() req: IUserRequest,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    return this.notificationService.markAsRead(req.user.id, notificationId);
  }
}
