import { Controller, Get } from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';
import { MailService } from './mail.service';

@ApiBearerAuth()
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test')
  test() {
    return this.mailService.sendMail();
  }
}
