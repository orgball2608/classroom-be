import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { NOTIFICATION_MESSAGES } from '@src/constants';
import { NotificationStatus } from '@prisma/client';
import { PrismaService } from '@src/shared/prisma/prisma.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(private readonly prisma: PrismaService) {}
  async findAllByUserId(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      message: NOTIFICATION_MESSAGES.GET_NOTIFICATIONS_SUCCESSFULLY,
      data: notifications,
    };
  }

  async findOne(userId: number, notificationId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: {
        id: notificationId,
        userId: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!notification) {
      return {
        message: NOTIFICATION_MESSAGES.NOTIFICATION_NOT_FOUND,
      };
    }

    return {
      message: NOTIFICATION_MESSAGES.GET_NOTIFICATION_BY_ID_SUCCESSFULLY,
      data: notification,
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
