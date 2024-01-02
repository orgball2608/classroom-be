import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TOKEN_MESSAGES, USERS_MESSAGES } from '@src/constants/message';
import { generateHash, validateHash } from '@src/common/utils';

import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { MapStudentIdWithUserIdDto } from './dto/map-student-id.dto';
import { PageDto } from '@src/common/dto/page.dto';
import { PageMetaDto } from '@src/common/dto/page-meta.dto';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { StorageService } from '@src/shared/storage/services/storage.service';
import { TokenInvalidException } from '@src/exceptions';
import { UpdateFullFieldUserDto } from './dto/update-full-field-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { UsersPageOptionsDto } from './dto/user-page-options.dto';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(pageOptionsDto: UsersPageOptionsDto) {
    const { skip, take, order, search } = pageOptionsDto;
    //search by name or email if search is not null
    let whereClause = {};

    if (search !== ' ' && search.length > 0) {
      //search by name or email
      const searchQuery = search.trim();
      whereClause = {
        OR: [
          {
            firstName: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            studentId: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        ],
      };
    }
    // eslint-disable-next-line prettier/prettier
    const itemCount = await this.prisma.user.count({
      where: whereClause,
    });

    const users = await this.prisma.user.findMany({
      skip,
      take,
      where: whereClause,
      orderBy: {
        createdAt: order,
      },
    });
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto,
    });

    const filteredUsers = users.map((user) =>
      _.omit(user, ['password', 'forgotPasswordToken', 'verifyEmailToken']),
    );

    const result = new PageDto(filteredUsers, pageMetaDto);

    return {
      message: USERS_MESSAGES.GET_USERS_LIST_SUCCESSFULLY,
      data: result,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

    return user;
  }

  private signForgotPasswordToken({ userId }: { userId: number }) {
    return this.jwtService.sign(
      { userId },
      {
        secret: this.config.getOrThrow<string>('auth.jwtForgotPasswordSecret'),
        expiresIn: `${this.config.getOrThrow<string>(
          'auth.jwtForgotPasswordExpires',
        )}s`,
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
      this.config.getOrThrow<string>('app.apiPrefix') +
      '/' +
      this.config.getOrThrow<string>('app.apiVersion');
    const resetLink = `${this.config.getOrThrow(
      'app.appURL',
    )}/${apiPrefix}/users/verify/forgot-password?token=${token}`;

    return this.mailerService.sendMail({
      to: email,
      from: 'elearningapp@gmail.com',
      subject: 'Email reset forgot password for leaning app',
      template: './forgot-password',
      context: {
        name,
        resetLink: resetLink,
      },
    });
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

    const token = this.signForgotPasswordToken({
      userId: user.id,
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

  verifyForgotPassword(token: string, role: string) {
    const frontendURL =
      role !== 'ADMIN'
        ? this.config.get('app.frontendURL')
        : this.config.get('app.adminFrontendURL');
    return `${frontendURL}/reset-password?token=${token}`;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { token, password } = resetPasswordDto;
      const payload: {
        userId: number;
      } = this.jwtService.verify(token, {
        secret: this.config.getOrThrow<string>('auth.jwtForgotPasswordSecret'),
        ignoreExpiration: false,
      });

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.userId,
        },
      });

      if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

      if (user.forgotPasswordToken != token)
        throw new BadRequestException(
          USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID,
        );

      await this.prisma.user.update({
        where: {
          email: user.email,
        },
        data: {
          password: generateHash(password),
          forgotPasswordToken: null,
        },
      });

      return {
        message: USERS_MESSAGES.RESET_PASSWORD_SUCCESSFUL,
      };
    } catch (error) {
      throw new TokenInvalidException(TOKEN_MESSAGES.TOKEN_IS_INVALID);
    }
  }

  /**
   * Changes the password of a user.
   * @param id - The ID of the user whose password needs to be changed.
   * @param changePasswordDto - An object containing the old password, new password, and confirm password.
   * @returns An object with a success message.
   * @throws NotFoundException if the user is not found or the passwords do not match.
   */
  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const { newPassword, oldPassword, confirmPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException(USERS_MESSAGES.PASSWORD_NOT_MATCH);
    }

    if (!(await validateHash(oldPassword, user.password))) {
      throw new BadRequestException(USERS_MESSAGES.PASSWORD_NOT_MATCH);
    }

    const hashedNewPassword = generateHash(newPassword);

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword,
      },
    });

    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESSFULLY,
    };
  }

  //check studentid used?
  async checkStudentIdUsed(studentId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        studentId,
      },
    });

    if (user) {
      throw new BadRequestException(USERS_MESSAGES.STUDENT_ID_USED);
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    avatar: Express.Multer.File,
    studentId: string,
  ) {
    const key = uuidv4();
    let avatarURL: string;

    if (updateUserDto?.studentId && !studentId) {
      await this.checkStudentIdUsed(updateUserDto.studentId);
    }

    if (avatar) {
      avatarURL = await this.storageService.uploadFile({
        key,
        file: avatar,
      });
    }

    const dataUpdate = !avatarURL
      ? { ...updateUserDto }
      : {
          ...updateUserDto,
          avatar: avatarURL ? avatarURL : null,
        };

    const user = await this.prisma.user.update({
      where: { id },
      data: dataUpdate,
    });

    if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

    return {
      message: USERS_MESSAGES.UPDATE_PROFILE_SUCCESSFULLY,
      data: _.omit(user, [
        'password',
        'verifyEmailToken',
        'forgotPasswordToken',
        'verify',
        'googleId',
        'facebookId',
        'role',
        'status',
      ]),
    };
  }

  async updateFullField(
    id: number,
    updateFullFieldUserDto: UpdateFullFieldUserDto,
    avatar: Express.Multer.File,
  ) {
    const key = uuidv4();

    let avatarURL: string;

    if (avatar) {
      avatarURL = await this.storageService.uploadFile({
        key,
        file: avatar,
      });
    }

    const dataUpdate = !avatarURL
      ? { ...updateFullFieldUserDto }
      : {
          ...updateFullFieldUserDto,
          avatar: avatarURL ? avatarURL : null,
        };

    const user = await this.prisma.user.update({
      where: { id },
      data: dataUpdate,
    });

    if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

    return {
      message: USERS_MESSAGES.UPDATE_PROFILE_SUCCESSFULLY,
      data: _.omit(user, [
        'password',
        'verifyEmailToken',
        'forgotPasswordToken',
        'googleId',
        'facebookId',
      ]),
    };
  }

  async mapStudentIdWithUserId(
    userId: number,
    mapStudentIdWithUserIdDto: MapStudentIdWithUserIdDto,
  ) {
    await this.checkStudentIdUsed(mapStudentIdWithUserIdDto.studentId);
    const data = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        studentId: mapStudentIdWithUserIdDto.studentId,
      },
    });
    if (!data) {
      throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);
    }

    return {
      message: USERS_MESSAGES.MAP_STUDENT_ID_WITH_USER_ID_SUCCESSFULLY,
      data,
    };
  }

  async unMapStudentId(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        studentId: null,
      },
    });

    return {
      message: USERS_MESSAGES.UN_MAP_STUDENT_ID_WITH_USER_ID_SUCCESSFULLY,
    };
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.delete({ where: { id } });

    if (!user) {
      throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);
    }

    return {
      message: USERS_MESSAGES.DELETE_USER_SUCCESSFULLY,
    };
  }

  async deleteUserList(userIds: number[]) {
    await this.prisma.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    return {
      message: USERS_MESSAGES.DELETE_USER_SUCCESSFULLY,
    };
  }

  async lockUser(id: number) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    });

    if (!user) {
      throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);
    }

    return {
      message: USERS_MESSAGES.LOCK_USER_SUCCESSFULLY,
    };
  }

  async unlockUser(id: number) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        deleted: false,
        deletedAt: new Date(),
      },
    });

    if (!user) {
      throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);
    }

    return {
      message: USERS_MESSAGES.UNLOCK_USER_SUCCESSFULLY,
    };
  }
}
