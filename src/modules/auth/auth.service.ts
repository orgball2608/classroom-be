import { AccessTokenParsed, UserRequest } from '@src/interfaces';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  generateHash,
  getDevideInfoFromRequest,
  getIpAddressFromRequest,
  validateHash,
} from '@src/common/utils';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { Request } from 'express';
import { USER_NOT_FOUND } from '@src/errors/errors.constant';
import { User } from '@prisma/client';
import { UserTakenException } from '@src/exceptions/user-taken.exception';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async register(registerDto: RegisterDto) {
    const { username, password } = registerDto;

    const isTaken = await this.isUsernameTaken(username);

    if (isTaken) {
      throw new UserTakenException();
    }

    const securedPassword = generateHash(password);

    return await this.prisma.user.create({
      data: {
        ...registerDto,
        password: securedPassword,
      },
    });
  }

  async login(req: UserRequest) {
    const user: AccessTokenParsed = req.user;

    const tokenId: string = uuidv4();
    const ip: string = getIpAddressFromRequest(req);
    const device: string = getDevideInfoFromRequest(req);

    await this.prisma.$transaction(async (tx) => {
      await tx.session.updateMany({
        where: {
          userId: user.id,
          tokenDeleted: false,
          ipAddress: ip,
          device,
        },
        data: {
          tokenDeleted: true,
        },
      });

      const tokenSecret: string = uuidv4();

      await tx.session.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          tokenId: tokenId,
          tokenSecret: tokenSecret,
          ipAddress: ip,
          loggedInAt: new Date(),
          device: device,
        },
      });
    });

    const accessToken = this.jwtService.sign(
      { id: user.id, tokenId: tokenId },
      {
        secret: this.config.get<string>('auth.secret'),
        // change expires unit to seconds
        expiresIn: this.config.get<number>('auth.expires') + 's',
      },
    );

    return {
      accessToken: accessToken,
    };
  }

  async getUser(id: number) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return user;
  }

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) throw new NotFoundException(USER_NOT_FOUND);

    const valid = await validateHash(password, user.password);

    if (!valid)
      throw new UnauthorizedException('Password or username is uncorrect');

    return { id: user.id };
  }

  async logout() {
    return {
      message: 'Logged out successfully',
    };
  }

  private async isUsernameTaken(username: string): Promise<boolean> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    return Boolean(existingUser);
  }
}
