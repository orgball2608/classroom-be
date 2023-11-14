import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { omit } from 'lodash';
import { UserEntity } from './entities/user.entity';
import { UsersPageOptionsDto } from './dto/user-page-options.dto';
import { PageDto } from '@src/common/dto/page.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({ type: [UserEntity] })
  @Get()
  findAll(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserEntity>> {
    return this.userService.findAll(pageOptionsDto);
  }

  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: UserEntity })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return omit(await this.userService.findOne(id), ['password']);
  }

  @ApiBody({ type: UpdateUserDto })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiParam({ name: 'id', type: Number, example: 1 })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
