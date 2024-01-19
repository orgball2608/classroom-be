import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IOAuthRequest, IUserRequest } from '@src/interfaces';
import { TOKEN_MESSAGES, USERS_MESSAGES } from '@src/constants/message';
import { User, VerifyStatus } from '@prisma/client';
import { generateHash, validateHash } from '@src/common/utils';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mails/mail.service';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendConfirmEmailDto } from './dto/resend-confirm-email.dto';
import { TokenInvalidException } from '@src/exceptions';
import { omit } from 'lodash';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}
  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const checkExistEmail = await this.isEmailTaken(email);

    if (checkExistEmail)
      throw new BadRequestException(USERS_MESSAGES.EMAIL_ALREADY_EXISTS);

    const securedPassword = generateHash(password);

    const verifyEmailToken = this.signEmailConfirmToken(email);

    await this.sendVerificationLink({
      email: registerDto.email,
      name: registerDto.firstName + '' + registerDto.lastName,
      token: verifyEmailToken,
    });

    await this.prisma.user.create({
      data: {
        ...registerDto,
        password: securedPassword,
        verifyEmailToken: verifyEmailToken,
      },
    });

    return {
      message: USERS_MESSAGES.REGISTER_SUCCESSFUL,
    };
  }

  private async isEmailTaken(email: string): Promise<boolean> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    return Boolean(existingUser);
  }

  private signEmailConfirmToken(email: string) {
    return this.jwtService.sign(
      { email },
      {
        secret: this.config.getOrThrow('mail.jwtMailSecret'),
        expiresIn: `${this.config.getOrThrow('mail.jwtMailExpires')}s`,
      },
    );
  }

  async login(req: IUserRequest) {
    const user: User = req.user;

    const accessToken = this.signAccessToken({
      userId: user.id,
      verifyStatus: VerifyStatus.VERIFY,
    });

    const refreshToken = this.signRefreshToken({
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

  async loginFacebook(req: IOAuthRequest) {
    const { profile } = req.user;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        facebookId: profile.id,
      },
    });

    let userId: number;

    if (!existingUser) {
      const newUser = await this.prisma.user.create({
        data: {
          firstName: profile.name.familyName,
          lastName: profile.name.givenName,
          facebookId: profile.id,
          verify: VerifyStatus.VERIFY,
        },
      });

      userId = newUser.id;
    } else {
      userId = existingUser.id;
    }

    const accessToken = this.signAccessToken({
      userId,
      verifyStatus: VerifyStatus.VERIFY,
    });

    const refreshToken = this.signRefreshToken({
      userId,
      verifyStatus: VerifyStatus.VERIFY,
    });

    const frontendURL = this.config.getOrThrow('app.frontendURL');

    return `${frontendURL}/signin?access_token=${accessToken}&refresh_token=${refreshToken}`;
  }

  async loginGoogle(req: IOAuthRequest) {
    const { profile } = req.user;
    const existingUser = await this.prisma.user.findUnique({
      where: { googleId: profile.id },
    });

    let userId: number;

    if (!existingUser) {
      const newUser = await this.prisma.user.create({
        data: {
          firstName: profile.name.familyName,
          lastName: profile.name.givenName,
          googleId: profile.id,
          avatar: profile.photos[0].value,
          verify: VerifyStatus.VERIFY,
        },
      });

      userId = newUser.id;
    } else {
      userId = existingUser.id;
    }

    const accessToken = this.signAccessToken({
      userId,
      verifyStatus: VerifyStatus.VERIFY,
    });

    const refreshToken = this.signRefreshToken({
      userId,
      verifyStatus: VerifyStatus.VERIFY,
    });

    const frontendURL = this.config.getOrThrow('app.frontendURL');

    return `${frontendURL}/signin?access_token=${accessToken}&refresh_token=${refreshToken}`;
  }

  private sendVerificationLink({
    email,
    name,
    token,
  }: {
    email: string;
    name: string;
    token: string;
  }) {
    const apiPrefix =
      this.config.getOrThrow<string>('app.apiPrefix') +
      '/' +
      this.config.getOrThrow<string>('app.apiVersion');

    const verifyEmailUrl = `${this.config.getOrThrow(
      'app.appURL',
    )}/${apiPrefix}/auth/verify-email?token=${token}`;

    return this.mailService.sendMail({
      to: email,
      from: 'elearningapp@gmail.com',
      subject: 'Email confirmation for leaning app',
      template: './verify-mail',
      context: {
        name,
        verifyEmailUrl,
      },
    });
  }

  private signAccessToken({
    userId,
    verifyStatus,
  }: {
    userId: number;
    verifyStatus: VerifyStatus;
  }) {
    return this.jwtService.sign(
      { id: userId, verifyStatus },
      {
        secret: this.config.getOrThrow<string>('auth.accessTokenSecret'),
        // change expires unit to seconds
        expiresIn:
          this.config.getOrThrow<number>('auth.accessTokenExpires') + 's',
      },
    );
  }

  private signRefreshToken({
    userId,
    verifyStatus,
  }: {
    userId: number;
    verifyStatus: VerifyStatus;
  }) {
    return this.jwtService.sign(
      { id: userId, verifyStatus },
      {
        secret: this.config.getOrThrow<string>('auth.refreshTokenSecret'),
        // change expires unit to seconds
        expiresIn:
          this.config.getOrThrow<number>('auth.refreshTokenExpires') + 's',
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

    if (!user)
      throw new NotFoundException(
        USERS_MESSAGES.PASSWORD_OR_USERNAME_INCORRECT,
      );

    const valid = await validateHash(password, user.password);

    if (!valid)
      throw new UnauthorizedException(
        USERS_MESSAGES.PASSWORD_OR_USERNAME_INCORRECT,
      );

    return { id: user.id, VerifyStatus: user.verify };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload: {
        id: number;
      } = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.config.getOrThrow<string>('auth.refreshTokenSecret'),
        ignoreExpiration: false,
      });

      const accessToken = this.signAccessToken({
        userId: payload.id,
        verifyStatus: VerifyStatus.VERIFY,
      });

      return {
        message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESSFULLY,
        data: {
          accessToken,
        },
      };
    } catch (error) {
      throw new TokenInvalidException(TOKEN_MESSAGES.TOKEN_IS_INVALID);
    }
  }

  async confirmEmail(token: string) {
    try {
      const payload: {
        email: string;
      } = this.jwtService.verify(token, {
        secret: this.config.getOrThrow<string>('mail.jwtMailSecret'),
        ignoreExpiration: false,
      });

      const user = await this.prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

      if (user.verify === VerifyStatus.VERIFY)
        throw new BadRequestException(USERS_MESSAGES.ACCOUNT_IS_VERIFIED);

      await this.prisma.user.update({
        where: {
          email: payload.email,
        },
        data: {
          verify: VerifyStatus.VERIFY,
          verifyEmailToken: null,
        },
      });

      return {
        message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESSFULLY,
      };
    } catch (error) {
      throw new TokenInvalidException(TOKEN_MESSAGES.TOKEN_IS_INVALID);
    }
  }

  async resendConfirmEmail(resendConfirmEmailDto: ResendConfirmEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: resendConfirmEmailDto.email,
      },
    });

    if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

    const verifyEmailToken = this.signEmailConfirmToken(user.email);

    await this.sendVerificationLink({
      email: user.email,
      name: user.firstName + user.lastName,
      token: verifyEmailToken,
    });

    await this.prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        verifyEmailToken: verifyEmailToken,
      },
    });

    return {
      message: USERS_MESSAGES.RESEND_CONFIRM_EMAIL_SUCCESSFULLY,
    };
  }

  async getMe(id: number) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    });
    return omit(user, [
      'password',
      'status',
      'verifyEmailToken',
      'forgotPasswordToken',
      'verify',
      'facebookId',
      'googleId',
      'role',
      'deletedAt',
      'deleted',
    ]);
  }

  logout() {
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESSFUL,
    };
  }
}
