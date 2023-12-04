import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { Socket } from 'dgram';

@WebSocketGateway({
  // cors: {
  //   origin: ['http://localhost:3000'],
  //   credentials: true,
  // },
  cors: {
    origin: '*',
  },
  pingInterval: 10000,
  pingTimeout: 15000,
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor() {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(`Socket id: ${socket.id} - Has connected!`);
    });
  }

  handleConnection(socket: Socket) {
    console.log('new coming connect');
    socket.emit('connected');
  }

  handleDisconnect(socket: Socket) {
    console.log('disconnect');
    socket.emit('disconnected');
  }

  @WebSocketServer()
  server: Server;
}
