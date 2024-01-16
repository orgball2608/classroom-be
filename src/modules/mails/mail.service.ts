import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('mail:send') private readonly sendMailQueue: Queue,
  ) {}

  async sendMail(options: {
    to: string;
    from: string;
    subject: string;
    template: string;
    context: Record<string, any>;
  }) {
    return this.sendMailQueue.add('mail:send', options);
  }
}
