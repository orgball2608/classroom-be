import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { QUEUES } from '@src/constants';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue(QUEUES.SEND_MAIL) private readonly sendMailQueue: Queue,
  ) {}

  async sendMail(options: {
    to: string;
    from: string;
    subject: string;
    template: string;
    context: Record<string, any>;
  }) {
    return this.sendMailQueue.add('mail:send', options, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 120000, // 2 minutes
      },
    });
  }
}
