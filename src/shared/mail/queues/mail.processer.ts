import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';

import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
@Processor('mail:send')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  public async process(
    job: Job<{
      emailAddress: string;
    }>,
  ) {
    try {
      console.log('Sending email to: ' + job.data.emailAddress);
      return this.mailerService.sendMail({
        to: job.data.emailAddress,
        from: 'elearningapp@gmail.com',
        subject: '',
        template: './verify-mail',
        context: {
          name: 'demo',
          verifyEmailUrl: 'demo',
        },
      });
    } catch {}
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    console.log('completed');
  }
}
