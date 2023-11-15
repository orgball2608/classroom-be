import { AccessTokenParsed, UserRequest } from '@src/interfaces';
import {
  BadRequestException,
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
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { ResendConfirmEmailDto } from './dto/resend-confirm-email.dto';
import { USERS_MESSAGES } from '@src/constants/message';
import { USER_NOT_FOUND } from '@src/errors/errors.constant';
import { VerifyStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailerService: MailerService,
  ) {}
  async register(registerDto: RegisterDto) {
    const { password } = registerDto;

    const securedPassword = generateHash(password);

    await this.sendVerificationLink(
      registerDto.email,
      registerDto.firstName + '' + registerDto.lastName,
    );

    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: securedPassword,
        isEmailConfirmed: false,
      },
    });

    const resendConfirmToken = this.jwtService.sign(
      {
        userId: user.id,
        email: user.email,
      },
      {
        secret: this.config.get('auth.jwtMailSecret'),
        expiresIn: `${this.config.get('auth.jwtMailExpires')}s`,
      },
    );

    //TODO: update resend token

    return {
      message: USERS_MESSAGES.REGISTER_SUCCESSFUL,
      data: {
        token: resendConfirmToken,
      },
    };
  }

  private signEmailConfirmToken(email: string) {
    return this.jwtService.sign(
      { email },
      {
        secret: this.config.get('auth.jwtMailSecret'),
        expiresIn: `${this.config.get('auth.jwtMailExpires')}s`,
      },
    );
  }

  private sendVerificationLink(email: string, name: string) {
    const token = this.signEmailConfirmToken(email);

    const apiPrefix =
      this.config.get<string>('app.apiPrefix') +
      '/' +
      this.config.get<string>('app.apiVersion');

    const verifyEmailAddressUrl = `${this.config.get(
      'APP_URL',
    )}/${apiPrefix}/auth/verify?token=${token}`;

    return this.mailerService.sendMail({
      to: email,
      from: 'elearningapp@gmail.com',
      subject: 'Email confirmation for leaning app',
      template: './index',
      context: {
        name,
        verifyEmailAddressUrl,
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

    const accessToken = this.signAccessToken({
      userId: user.id,
      tokenId,
      verifyStatus: VerifyStatus.VERIFY,
    });

    const refreshToken = this.signRefeshToken({
      userId: user.id,
      verifyStatus: VerifyStatus.VERIFY,
    });

    return {
      message: USERS_MESSAGES.LOGIN_SUCCESSFUL,
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }

  private signAccessToken({
    userId,
    tokenId,
    verifyStatus,
  }: {
    userId: number;
    tokenId: string;
    verifyStatus: VerifyStatus;
  }) {
    return this.jwtService.sign(
      { id: userId, tokenId: tokenId, verifyStatus },
      {
        secret: this.config.get<string>('auth.accessTokenSecret'),
        // change expires unit to seconds
        expiresIn: this.config.get<number>('auth.accessTokenExpires') + 's',
      },
    );
  }

  private signRefeshToken({
    userId,
    verifyStatus,
  }: {
    userId: number;
    verifyStatus: VerifyStatus;
  }) {
    return this.jwtService.sign(
      { id: userId, verifyStatus },
      {
        secret: this.config.get<string>('auth.refreshTokenSecret'),
        // change expires unit to seconds
        expiresIn: this.config.get<number>('auth.refreshTokenExpires') + 's',
      },
    );
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
      throw new UnauthorizedException(
        USERS_MESSAGES.PASSWORD_OR_USERNAME_INCORRECT,
      );

    return { id: user.id, isEmailConfirmed: user.isEmailConfirmed };
  }

  async refreshToken(userId: number) {
    const tokenId: string = uuidv4();

    const accessToken = this.signAccessToken({
      tokenId,
      userId,
      verifyStatus: VerifyStatus.VERIFY,
    });

    return {
      message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESSFULLY,
      data: {
        accessToken,
      },
    };
  }

  async confirmEmail(token: string) {
    const payload: {
      email: string;
    } = this.jwtService.verify(token, {
      secret: this.config.get<string>('auth.jwtMailSecret'),
      ignoreExpiration: false,
    });

    const user = await this.prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

    await this.prisma.user.update({
      where: {
        email: payload.email,
      },
      data: {
        isEmailConfirmed: true,
      },
    });

    return {
      message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESSFULLY,
    };
  }

  async resendConfirmEmail(resendConfirmEmailDto: ResendConfirmEmailDto) {
    const payload: {
      userId: number;
      email: string;
    } = this.jwtService.verify(resendConfirmEmailDto.token, {
      secret: this.config.get<string>('auth.jwtMailSecret'),
      ignoreExpiration: false,
    });

    const user = await this.prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

    await this.sendVerificationLink(user.email, user.firstName + user.lastName);

    return {
      message: USERS_MESSAGES.RESEND_CONFIRM_EMAIL_SUCCESSLY,
    };
  }

  private signForgotPasswordToken({
    userId,
    verifyStatus,
  }: {
    userId: number;
    verifyStatus: VerifyStatus;
  }) {
    return this.jwtService.sign(
      { userId, verifyStatus },
      {
        secret: this.config.get('auth.jwtForgotPasswordSecret'),
        expiresIn: `${this.config.get('auth.jwtForgotPasswordExpires')}s`,
      },
    );
  }

  private sendForgotPasswordMail({
    email,
    token,
    name,
  }: {
    email: string;
    token: string;
    name: string;
  }) {
    const apiPrefix =
      this.config.get<string>('app.apiPrefix') +
      '/' +
      this.config.get<string>('app.apiVersion');

    const forgotPasswordEmailAddressUrl = `${this.config.get(
      'APP_URL',
    )}/${apiPrefix}/auth/forgot-passwordx?token=${token}`;

    return this.mailerService.sendMail({
      to: email,
      from: 'elearningapp@gmail.com',
      subject: 'Email reset forgot password for leaning app',
      template: './index',
      context: {
        name,
        forgotPasswordEmailAddressUrl,
      },
    });
  }

  async resetPassword({
    email,
    verifyStatus,
  }: {
    email: string;
    verifyStatus: VerifyStatus;
  }) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

    if (user.verify !== verifyStatus)
      throw new BadRequestException(USERS_MESSAGES.VERIFY_STATUS_INCORRECT);

    const token = this.signForgotPasswordToken({
      userId: user.id,
      verifyStatus,
    });

    await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        forgotPasswordToken: token,
      },
    });

    const name = user.firstName + user.lastName;

    await this.sendForgotPasswordMail({ email, token, name });

    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD,
    };
  }

  async logout() {
    return {
      message: USERS_MESSAGES.LOGOUT_SUCESSFULL,
    };
  }
}
