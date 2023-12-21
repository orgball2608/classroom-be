import { BadRequestException, Injectable } from '@nestjs/common';

import { NOTIFICATION_MESSAGES } from '@src/constants';
import { NotificationStatus } from '@prisma/client';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { SimpleUserEntity } from './../../common/entity/simple-user.entity';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}
  async findAllByUserId(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        creator: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const response = notifications.map((notification) => {
      const { creator: creatorData, ...rest } = notification;
      const creator = new SimpleUserEntity(creatorData);
      return {
        ...rest,
        creator,
      };
    });

    return {
      message: NOTIFICATION_MESSAGES.GET_NOTIFICATIONS_SUCCESSFULLY,
      data: response,
    };
  }

  async findOne(userId: number, notificationId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: {
        id: notificationId,
        userId: userId,
      },
      include: {
        creator: true,
      },
    });

    if (!notification) {
      return {
        message: NOTIFICATION_MESSAGES.NOTIFICATION_NOT_FOUND,
      };
    }

    const { creator: creatorData, ...rest } = notification;

    const creator = new SimpleUserEntity(creatorData);

    return {
      message: NOTIFICATION_MESSAGES.GET_NOTIFICATION_BY_ID_SUCCESSFULLY,
      data: {
        ...rest,
        creator,
      },
    };
  }

  async markAsRead(userId: number, notificationId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: {
        id: notificationId,
        userId: userId,
      },
    });

    if (!notification) {
      throw new BadRequestException(
        NOTIFICATION_MESSAGES.NOTIFICATION_NOT_FOUND,
      );
    }

    await this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        status: NotificationStatus.READ,
      },
    });

    return {
      message: NOTIFICATION_MESSAGES.MARK_AS_READ_SUCCESSFULLY,
    };
  }
}
