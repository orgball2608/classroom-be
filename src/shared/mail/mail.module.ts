import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailController } from './mail.controller';
import { MailProcessor } from './queues/mail.processer';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow('mail.host'),
          port: config.getOrThrow('mail.port'),
          secure: true,
          auth: {
            user: config.getOrThrow('mail.username'),
            pass: config.getOrThrow('mail.password'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        template: {
          dir: process.cwd() + '/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'mail:send',
    }),
  ],
  providers: [MailService, MailProcessor],
  controllers: [MailController],
  exports: [MailerModule],
})
export class MailModule {}
