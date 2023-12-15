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
import { GatewayModule } from './shared/gateway/gateway.module';
import { HealthModule } from './modules/health/health.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './shared/prisma/prisma.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { RedisModule } from './shared/redis/redis.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './modules/users/user.module';
import appConfig from '@src/configs/app.config';
import authConfig from './configs/auth.config';
import awsConfig from './configs/aws.config';
import databaseConfig from './configs/database.config';
import redisConfig from './configs/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig, redisConfig, awsConfig],
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
      path: '/metrics',
    }),
    PrismaModule,
    RedisModule,
    GatewayModule,
    SharedModule,
    AuthModule,
    UserModule,
    CourseModule,
    HealthModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticateMiddleware)
      .exclude(
        {
          path: 'auth',
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
      )
      .forRoutes('*');
  }
}
