import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import {
  HttpAdapterHost,
  ModuleRef,
  NestFactory,
  Reflector,
} from '@nestjs/core';
import { HttpExceptionFilter, PrismaClientExceptionFilter } from './filters';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Environment } from './common/enum/node-env';
import { WebsocketAdapter } from './shared/gateway/gateway.adapter';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './swagger/setup-swagger';

async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { cors: true },
  );

  const configService = app.get(ConfigService);
  const PORT = configService.getOrThrow<number>('app.port') || 3001;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove all non-whitelisted properties
      transform: true, // Automatically transform payloads to DTO instances
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  const moduleRef = app.get(ModuleRef);
  const adapter = new WebsocketAdapter(app, moduleRef);
  app.useWebSocketAdapter(adapter);

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );
  app.use(compression());
  app.use(morgan('combined'));
  app.enableVersioning();
  app.useLogger(['debug', 'error', 'log', 'verbose', 'warn']);

  const { httpAdapter } = app.get(HttpAdapterHost);
  const reflector = app.get(Reflector);

  app.useGlobalFilters(
    new HttpExceptionFilter(reflector),

    new PrismaClientExceptionFilter(httpAdapter),
  );

  const apiPrefix =
    configService.getOrThrow<string>('app.apiPrefix') +
    '/' +
    configService.getOrThrow<string>('app.apiVersion');

  app.setGlobalPrefix(apiPrefix);

  //Swagger
  const isDocumentEnabled = configService.getOrThrow<boolean>(
    'app.documentEnabled',
  );

  if (isDocumentEnabled) {
    setupSwagger(app, PORT);
  }

  //Enable shutdown hooks
  const isDevelopment =
    configService.getOrThrow<string>('app.nodeEnv') === Environment.DEVELOPMENT;

  if (!isDevelopment) {
    app.enableShutdownHooks();
  }

  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

  return app;
}

void bootstrap();
