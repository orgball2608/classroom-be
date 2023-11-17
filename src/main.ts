import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { HttpExceptionFilter, PrismaClientExceptionFilter } from './filters';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './swagger/setup-swagger';

async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { cors: true , },
  );

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('app.port') || 3001;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove all non-whitelisted properties
      transform: true, // Automatically transform payloads to DTO instances
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

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

  const { httpAdapter } = app.get(HttpAdapterHost);
  const reflector = app.get(Reflector);

  app.useGlobalFilters(
    new HttpExceptionFilter(reflector),

    new PrismaClientExceptionFilter(httpAdapter),
  );

  const apiPrefix =
    configService.get<string>('app.apiPrefix') +
    '/' +
    configService.get<string>('app.apiVersion');

  app.setGlobalPrefix(apiPrefix);

  //Swagger
  setupSwagger(app, PORT);

  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

  return app;
}

void bootstrap();
