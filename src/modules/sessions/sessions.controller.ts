import {
  Controller,
  Get,
  Param,
  Delete,
  Request,
  ParseIntPipe,
  Ip,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRequest } from '@src/interfaces';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}
  @Get()
  findAll(@Request() req: UserRequest, @Ip() ip: string) {
    return this.sessionsService.findAll(req, ip);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.findOne(id);
  }

  @Delete(':id')
  remove(
    @Request() req: UserRequest,
    @Param('id', ParseIntPipe) id: number,
    @Ip() ip: string,
  ) {
    return this.sessionsService.remove(req, ip, id);
  }

  @Delete('/all')
  removeAll(@Request() req: UserRequest, @Ip() ip: string) {
    return this.sessionsService.removeAll(req, ip);
  }

  @Delete('all/not-current')
  removeAllNotCurrent(@Request() req: UserRequest, @Ip() ip: string) {
    return this.sessionsService.removeAllNotCurrent(req, ip);
  }
}
