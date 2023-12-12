import { Socket } from 'socket.io';
import { User } from '@prisma/client';
export interface IAuthenticatedSocket extends Socket {
  user?: User;
}
