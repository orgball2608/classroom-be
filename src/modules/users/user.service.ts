import { Injectable, NotFoundException } from '@nestjs/common';

import { PageDto } from '@src/common/dto/page.dto';
import { PageMetaDto } from '@src/common/dto/page-meta.dto';
import { PrismaService } from '@src/shared/prisma/prisma.service';
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

  async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    const { username, password } = updateUserDto;
    const newPassword = password && generateHash(password);

    const isTaken = await this.isUsernameTaken(username);
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

    if (!user) throw new NotFoundException(`User #${id} not found`);
  }

  async remove(id: number): Promise<void> {
    const user = await this.prisma.user.delete({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
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
