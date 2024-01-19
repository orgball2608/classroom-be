import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { AuthenticateMiddleware } from './middlewares';
import { BullModule } from '@nestjs/bullmq';
import { ClsModule } from 'nestjs-cls';
import { CourseModule } from './modules/courses/course.module';
import { Environment } from './common/enum/node-env';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ExcelModule } from './modules/excels/excel.module';
import { GatewayModule } from './shared/gateway/gateway.module';
import { GradeBoardModule } from './modules/grade-boards/grade-board.module';
import { GradeCompositionModule } from './modules/grade-compositions/grade-composition.module';
import { GradeModule } from './modules/grades/grade.module';
import { GradeReviewModule } from './modules/grade-reviews/grade-review.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { HealthModule } from './modules/health/health.module';
import { JwtModule } from '@nestjs/jwt';
import { LogLevel } from './common/enum/logger-level';
import { LoggerModule } from 'nestjs-pino';
import { MailModule } from './modules/mails/mail.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationModule } from './modules/notifications/notification.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ROUTES } from './constants';
import { RedisModule } from './shared/redis/redis.module';
import { SharedModule } from './shared/shared.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { UserModule } from './modules/users/user.module';
import appConfig from '@src/configs/app.config';
import authConfig from './configs/auth.config';
import awsConfig from './configs/aws.config';
import databaseConfig from './configs/database.config';
import mailConfig from './configs/mail.config';
import redisConfig from './configs/redis.config';
import throttlerConfig from './configs/throttler.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        authConfig,
        databaseConfig,
        redisConfig,
        awsConfig,
        mailConfig,
        throttlerConfig,
      ],
      cache: true,
      expandVariables: true,
      envFilePath: process.env.NODE_ENV == 'development' ? '.env.dev' : '.env',
      validationOptions: {
        abortEarly: false,
      },
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [{
          ttl: configService.getOrThrow('throttler.ttl'),
          limit: configService.getOrThrow('throttler.limit'),
          storage: new ThrottlerStorageRedisService( {
            db: configService.getOrThrow('redis.dbThrottler'),
            host: configService.getOrThrow('redis.host'),
            port: configService.getOrThrow('redis.port'),
            password: configService.getOrThrow('redis.password'),
          } ),
        }]
      }),
      inject: [ConfigService],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const logLevel =
          config.getOrThrow('app.nodeEnv') === Environment.PRODUCTION ? LogLevel.DEBUG :  LogLevel.INFO;
        return {
          exclude: ['health', 'metrics'],
          pinoHttp: { level: logLevel },
          transport:
            config.getOrThrow('app.nodeEnv') !== 'production'
              ? {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                    colorize: true,
                    levelFirst: true,
                    translateTime: 'mmm-dd h:MM:ss',
                    ignore: 'hostname',
                  },
                }
              : null,
              customLogLevel: (req: any, res:any, err:any) => {
                if (res.statusCode === 401) {
                  return 'silent';
                }
                if (res.statusCode >= 400 && res.statusCode < 500) {
                  return 'warn';
                } else if (res.statusCode >= 500 || err) {
                  return 'error';
                }
                return 'info';
              },
        };
      },
    }),
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
    JwtModule.register({}),
    EventEmitterModule.forRoot(),
    PrometheusModule.register({
      path: ROUTES.METRICS,
    }),
    PrismaModule,
    RedisModule,
    GatewayModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          db: configService.getOrThrow('redis.dbBullQueue'),
          host: configService.getOrThrow('redis.host'),
          port: configService.getOrThrow('redis.port'),
          password: configService.getOrThrow('redis.password'),
        },
      }),
    }),
    SharedModule,
    MailModule,
    AuthModule,
    UserModule,
    CourseModule,
    HealthModule,
    NotificationModule,
    GradeCompositionModule,
    GradeBoardModule,
    GradeModule,
    ExcelModule,
    GradeReviewModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticateMiddleware)
      .exclude(
        {
          path: 'auth/(.*)',
          method: RequestMethod.ALL,
        },
        {
          path: 'health',
          method: RequestMethod.GET,
        },
        {
          path: 'metrics',
          method: RequestMethod.GET,
        },

        {
          path: 'users/forgot-password',
          method: RequestMethod.POST,
        },
        {
          path: 'users/verify/forgot-password',
          method: RequestMethod.GET,
        },
        {
          path: 'users/reset-password',
          method: RequestMethod.POST,
        },
      )
      .forRoutes('*');
  }
}
