import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow('mailer.mailHost'),
          port: config.getOrThrow('mailer.mailPort'),
          secure: true,
          auth: {
            user: config.getOrThrow('mailer.mailUsername'),
            pass: config.getOrThrow('mailer.mailPassword'),
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
    }),
  ],
  exports: [MailerModule],
})
export class CustomMailerModule {}
