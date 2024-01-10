import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { EMIT_MESSAGES, PROVIDERS, SOCKET_MESSAGES } from '@src/constants';
import { Server } from 'socket.io';
import { Inject } from '@nestjs/common';
import { IGatewaySessionManager } from './gateway.session';
import { IAuthenticatedSocket, INotification } from '@src/interfaces';
import _ from 'lodash';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  pingInterval: 10000,
  pingTimeout: 15000,
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PROVIDERS.GATEWAY_SESSION_MANAGER)
    readonly session: IGatewaySessionManager,
  ) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket: IAuthenticatedSocket) => {
      console.log('new coming connect');
      console.log(`Socket id: ${socket.id} - Has connected!`);
    });
  }

  handleConnection(socket: IAuthenticatedSocket) {
    this.session.setUserSocket(socket.user.id, socket);
    socket.emit('connected');
  }

  handleDisconnect(socket: IAuthenticatedSocket) {
    this.session.removeUserSocket(socket.user.id);
    socket.emit('disconnected');
  }

  getNotifications() {
    return this.prisma.notification.findMany();
  }

  @OnEvent(EMIT_MESSAGES.NOTIFICATION_CREATED)
  async sendPush(payload: {
    userId: number;
    notificationData: INotification;
  }): Promise<void> {
    const message = await this.prisma.notification.create({
      data: payload.notificationData,
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

    const socket = this.session.getUserSocket(payload.userId);

    if (socket) {
      socket.emit(
        SOCKET_MESSAGES.NOTIFICATION_CREATED,
        _.omit(message, 'updatedAt'),
      );
    }
  }
}
