import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { AuthenticateMiddleware } from './middlewares';
import { ConfigModule } from '@nestjs/config';
import { CourseModule } from './modules/courses/course.module';
import { CustomMailerModule } from './shared/mailer/mailer.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GatewayModule } from './shared/gateway/gateway.module';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from './shared/notification/notification.module';
import { PrismaModule } from './shared/prisma/prisma.module';
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
    PrismaModule,
    RedisModule,
    GatewayModule,
    NotificationModule,
    SharedModule,
    AuthModule,
    UserModule,
    CourseModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticateMiddleware).exclude('auth/(.*)').forRoutes('*');
  }
}
