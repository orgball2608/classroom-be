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
  Res,
  Req,
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
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRequest } from '@src/interfaces';

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

  @ApiBody({ type: ChangePasswordDto })
  @Patch('/change-password')
  changePassword(
    @Req() req: UserRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const id = req.user.id;
    console.log('id', id, changePasswordDto);
    return this.userService.changePassword(id, changePasswordDto);
  }

  @ApiBody({ type: UpdateUserDto })
  @Patch('me')
  update(@Req() req: UserRequest, @Body() updateUserDto: UpdateUserDto) {
    const id = req.user.id;
    return this.userService.update(id, updateUserDto);
  }

  @ApiParam({ name: 'id', type: Number, example: 1 })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
