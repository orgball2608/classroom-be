import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('mail:send') private readonly sendMailQueue: Queue,
  ) {}

  async sendMail() {
    await this.sendMailQueue.add('mail:send', {
      emailAddress: 'demo@gmail.com',
    });

    return true;
  }
}
