import { Injectable, NotFoundException } from '@nestjs/common';

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
    const { email, password } = updateUserDto;
    const newPassword = password && generateHash(password);

    const isTaken = await this.isEmailTaken(email);

    if (isTaken) {
      throw new UserTakenException();
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        password: newPassword,
      },
    });

    if (!user) throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);

    return {
      message: USERS_MESSAGES.UPDATE_PROFILE_SUCCESSFULLY,
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
