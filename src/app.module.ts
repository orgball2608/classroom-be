import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { AuthenticateMiddleware } from './middlewares';
import { ConfigModule } from '@nestjs/config';
import { CourseModule } from './modules/courses/course.module';
import { CustomMailerModule } from './shared/mailer/mailer.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ExcelModule } from './modules/excels/excel.module';
import { GatewayModule } from './shared/gateway/gateway.module';
import { GradeBoardModule } from './modules/grade-boards/grade-board.module';
import { GradeCompositionModule } from './modules/grade-compositions/grade-composition.module';
import { GradeModule } from './modules/grades/grade.module';
import { GradeReviewModule } from './modules/grade-reviews/grade-review.module';
import { HealthModule } from './modules/health/health.module';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from './modules/notifications/notification.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ROUTES } from './constants';
import { RedisModule } from './shared/redis/redis.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './modules/users/user.module';
import appConfig from '@src/configs/app.config';
import authConfig from './configs/auth.config';
import awsConfig from './configs/aws.config';
import databaseConfig from './configs/database.config';
import mailConfig from './configs/mail.config';
import redisConfig from './configs/redis.config';

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
      ],
      cache: true,
      expandVariables: true,
      envFilePath: process.env.NODE_ENV == 'development' ? '.env.dev' : '.env',
      validationOptions: {
        abortEarly: false,
      },
    }),
    CustomMailerModule,
    JwtModule.register({}),
    EventEmitterModule.forRoot(),
    PrometheusModule.register({
      path: ROUTES.METRICS,
    }),
    PrismaModule,
    RedisModule,
    GatewayModule,
    SharedModule,
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
