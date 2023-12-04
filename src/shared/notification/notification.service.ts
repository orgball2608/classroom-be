import * as admin from 'firebase-admin';
import * as firebase from 'firebase-admin';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';

firebase.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY,
  }),
  databaseURL: 'https://fcm.googleapis.com/fcm/',
});
@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async acceptPushNotification(
    user: any,
    createNotificationDto: CreateNotificationDto,
  ) {
    await this.prisma.notificationToken.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        status: 'INACTIVE',
      },
    });

    const notificationToken = await this.prisma.notificationToken.create({
      data: {
        userId: user.id,
        deviceType: createNotificationDto.deviceType,
        notificationToken: createNotificationDto.notificationToken,
        status: 'ACTIVE',
      },
    });

    return notificationToken;
  }

  async disablePushNotification(
    user: any,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<void> {
    try {
      await this.prisma.notificationToken.updateMany({
        where: {
          userId: user.id,
          deviceType: updateNotificationDto.deviceType,
        },
        data: {
          status: 'INACTIVE',
        },
      });
    } catch (error) {
      return error;
    }
  }

  getNotifications() {
    return this.prisma.notification.findMany();
  }

  async sendPush(user: any, title: string, body: string): Promise<void> {
    try {
      const notificationToken =
        await this.prisma.notificationToken.findFirstOrThrow({
          where: { user: { id: user.id }, status: 'ACTIVE' },
        });

      if (notificationToken) {
        await this.prisma.notification.create({
          data: {
            notificationTokenId: notificationToken.id,
            title,
            body,
            status: 'UNREAD',
            createdBy: user.firstName,
          },
        });

        await firebase
          .messaging()
          .send({
            notification: { title, body },
            token: notificationToken.notificationToken,
          })
          .catch((error: any) => {
            console.error(error);
          });
      }
    } catch (error) {
      return error;
    }
  }
}
