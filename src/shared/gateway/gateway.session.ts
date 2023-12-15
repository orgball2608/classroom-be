import { IAuthenticatedSocket } from '@src/interfaces';
import { Injectable } from '@nestjs/common';

export interface IGatewaySessionManager {
  getUserSocket(id: number): IAuthenticatedSocket;
  setUserSocket(id: number, socket: IAuthenticatedSocket): void;
  removeUserSocket(id: number): void;
  getSockets(): Map<number, IAuthenticatedSocket>;
}

@Injectable()
export class GatewaySessionManager implements IGatewaySessionManager {
  private readonly sessions: Map<number, IAuthenticatedSocket> = new Map();

  getUserSocket(id: number) {
    return this.sessions.get(id);
  }

  setUserSocket(userId: number, socket: IAuthenticatedSocket) {
    this.sessions.set(userId, socket);
  }
  removeUserSocket(userId: number) {
    this.sessions.delete(userId);
  }
  getSockets(): Map<number, IAuthenticatedSocket> {
    return this.sessions;
  }
}
