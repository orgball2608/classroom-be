import { IoAdapter } from '@nestjs/platform-socket.io';
import { Socket } from 'socket.io';

export class WebsocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    server.use(async (socket: Socket, next) => {
      console.log('socket.id:', socket.id);
      next();
    });
    return server;
  }
}
