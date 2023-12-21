import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common';

import { NotificationService } from './notification.service';
import { IUserRequest } from '@src/interfaces';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ROUTES } from '@src/constants';
import { Notification } from './entities/notification.entity';
import {
  ApiResponseArrayDataWithMessage,
  ApiResponseWithMessage,
} from '@src/decorators';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller(ROUTES.NOTIFICATIONS)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiResponseArrayDataWithMessage(Notification)
  findAllByUserId(@Req() req: IUserRequest) {
    return this.notificationService.findAllByUserId(req.user.id);
  }

  @Get(':id')
  @ApiResponseWithMessage(Notification)
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
