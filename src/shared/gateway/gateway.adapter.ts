import { ConfigService } from '@nestjs/config';
import { IAuthenticatedSocket } from '@src/interfaces';
import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { JwtService } from '@nestjs/jwt';
import { ModuleRef } from '@nestjs/core';
import { NextFunction } from 'express';
import { PrismaService } from './../prisma/prisma.service';

export class WebsocketAdapter extends IoAdapter {
  private jwtService: JwtService;
  private configService: ConfigService;
  private prismaService: PrismaService;
  constructor(
    app: INestApplicationContext,
    private moduleRef: ModuleRef,
  ) {
    super(app);
    this.jwtService = this.moduleRef.get(JwtService, { strict: false });
    this.configService = this.moduleRef.get(ConfigService, { strict: false });
    this.prismaService = this.moduleRef.get(PrismaService, { strict: false });
  }
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.use(async (socket: IAuthenticatedSocket, next: NextFunction) => {
      const token = socket.handshake.query.accessToken as string;
      if (!token) {
        socket.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow<string>('auth.accessTokenSecret'),
        ignoreExpiration: false,
      });

      if (!payload) {
        socket.disconnect();
        return;
      }

      const user = await this.prismaService.user.findUnique({
        where: {
          id: payload.id,
        },
      });

      socket.user = user;

      next();
    });

    return server;
  }
}
