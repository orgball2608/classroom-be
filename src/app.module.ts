import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { AuthenticateTokenMiddleware } from './middlewares';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './shared/prisma/prisma.module';
import { RedisModule } from './shared/redis/redis.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './modules/users/user.module';
import appConfig from '@src/configs/app.config';
import authConfig from './configs/auth.config';
import databaseConfig from './configs/database.config';
import redisConfig from './configs/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig, redisConfig],
      cache: true,
      expandVariables: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
      validationOptions: {
        abortEarly: false,
      },
    }),
    PrismaModule,
    RedisModule,
    SharedModule,
    AuthModule,
    UserModule,
    JwtModule.register({}),
    SessionsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticateTokenMiddleware)
      .exclude('auth/(.*)')
      .forRoutes('*');
  }
}
