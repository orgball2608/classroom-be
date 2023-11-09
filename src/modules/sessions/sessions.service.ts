import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UserRequest } from '@src/interfaces';
import { getDevideInfoFromRequest } from '@src/common/utils';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(req: UserRequest, ip: string) {
    const { tokenId, id } = req.user;

    const devide: string = getDevideInfoFromRequest(req);

    const sessions = await this.prisma.session.findMany({
      where: {
        userId: id,
      },
      orderBy: {
        loggedInAt: 'desc',
      },
    });

    const response = sessions.map((session) => {
      if (
        tokenId === session.tokenId &&
        ip === session.ipAddress &&
        session.device == devide
      ) {
        return {
          ...session,
          current: true,
        };
      }
      return session;
    });

    return response;
  }

  async findOne(id: number) {
    const session = this.prisma.session.findUnique({
      where: {
        id,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async remove(req: UserRequest, ip: string, id: number) {
    const { tokenId, id: userId } = req.user;
    const session = await this.prisma.session.findUnique({
      where: {
        id,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.session.update({
      where: {
        userId_tokenId: {
          userId,
          tokenId,
        },
      },
      data: { tokenDeleted: true },
    });

    const devide: string = getDevideInfoFromRequest(req);

    if (
      tokenId == session.tokenId &&
      session.ipAddress == ip &&
      session.device == devide
    ) {
      return {
        ...session,
        current: true,
      };
    }

    return session;
  }

  async removeAll(req: UserRequest, ip: string) {
    const { tokenId, id: userId } = req.user;
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
      },
    });

    await this.prisma.session.updateMany({
      where: {
        userId,
      },
      data: { tokenDeleted: true },
    });

    const devide: string = getDevideInfoFromRequest(req);

    const response = sessions.map((session) => {
      if (
        tokenId == session.tokenId &&
        session.ipAddress == ip &&
        session.device == devide
      ) {
        return {
          ...session,
          current: true,
        };
      }

      return session;
    });

    return response;
  }

  async removeAllNotCurrent(req: UserRequest, ip: string) {
    const { tokenId, id: userId } = req.user;
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
      },
    });

    const devide: string = getDevideInfoFromRequest(req);

    let currentUserId: number;

    const response = sessions.map((session) => {
      if (
        tokenId == session.tokenId &&
        session.ipAddress == ip &&
        session.device == devide
      ) {
        currentUserId = session.id;
        return {
          ...session,
          current: true,
        };
      }
      return session;
    });

    await this.prisma.session.updateMany({
      where: {
        userId,
        NOT: {
          id: currentUserId,
        },
      },
      data: { tokenDeleted: true },
    });

    return response;
  }
}
