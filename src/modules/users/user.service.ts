import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ChangePasswordDto } from './dto/change-password.dto';
import { PageDto } from '@src/common/dto/page.dto';
import { PageMetaDto } from '@src/common/dto/page-meta.dto';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { USERS_MESSAGES } from '@src/constants/message';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { UserEntity } from './entities/user.entity';
import { UserTakenException } from '@src/exceptions/user-taken.exception';
import { UsersPageOptionsDto } from './dto/user-page-options.dto';
import _ from 'lodash';
import { generateHash } from '@src/common/utils';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserEntity>> {
    const { skip, take, order } = pageOptionsDto;

    const itemCount = await this.prisma.user.count();
    const users = await this.prisma.user.findMany({
      skip,
      take,
      orderBy: {
        createdAt: order,
      },
    });

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto,
    });

    const filteredUsers = users.map((user) => _.omit(user, ['password']));

    return new PageDto(filteredUsers, pageMetaDto);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException(`User #${id} not found`);

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { email } = updateUserDto;

    const isEmailTaken = await this.isEmailTaken(email);

    if (isEmailTaken) {
      throw new UserTakenException();
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

    return {
      message: USERS_MESSAGES.UPDATE_PROFILE_SUCCESSFULLY,
      data: _.omit(user, ['password', 'status', 'isEmailConfirmed']),
    };
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

    const hashedOldPassword = generateHash(oldPassword);

    if (hashedOldPassword !== user.password) {
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

  async remove(id: number) {
    const user = await this.prisma.user.delete({ where: { id } });

    if (!user) {
      throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);
    }

    return {
      message: USERS_MESSAGES.DELETE_USER_SUCCESSFULLY,
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
}
