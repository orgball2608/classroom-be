import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';

import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { QUEUES } from '@src/constants';

@Injectable()
@Processor(QUEUES.SEND_MAIL)
export class SendMailProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  public async process(
    job: Job<{
      to: string;
      from: string;
      subject: string;
      template: string;
      context: Record<string, any>;
    }>,
  ) {
    return this.mailerService.sendMail({
      to: job.data.to,
      from: job.data.from,
      subject: job.data.subject,
      template: job.data.template,
      context: {
        name: job.data.context.name,
        verifyEmailUrl: job.data.context.verifyEmailUrl,
      },
    });
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    console.log('completed');
  }
}
