import { AccessTokenParsed, UserRequest } from '@src/interfaces';
import {
  ForbiddenException,
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
import { USER_NOT_FOUND } from '@src/errors/errors.constant';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async register(registerDto: RegisterDto) {
    const { password } = registerDto;

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
        secret: this.config.get<string>('auth.accessTokenSecret'),
        // change expires unit to seconds
        expiresIn: this.config.get<number>('auth.accessTokenExpires') + 's',
      },
    );

    const refreshToken = this.jwtService.sign(
      { id: user.id },
      {
        secret: this.config.get<string>('auth.refreshTokenSecret'),
        // change expires unit to seconds
        expiresIn: this.config.get<number>('auth.refreshTokenExpires') + 's',
      },
    );

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
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

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
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

  async refreshToken(userId: number) {
    const tokenId: string = uuidv4();

    const accessToken = this.jwtService.sign(
      { id: userId, tokenId: tokenId },
      {
        secret: this.config.get<string>('auth.accessTokenSecret'),
        // change expires unit to seconds
        expiresIn: this.config.get<number>('auth.accessTokenExpires') + 's',
      },
    );

    return {
      accessToken,
    };
  }
}
