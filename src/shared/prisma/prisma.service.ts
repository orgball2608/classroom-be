import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient, User } from '@prisma/client';

import { Expose } from './prisma.interface';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  async onModuleInit() {
    await this.$connect();
    this.$use(this.softDeleteMiddleware);
  }

  async exitHandler(app: INestApplication) {
    await app.close();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', () => {
      this.exitHandler(app);
    });
  }

  softDeleteMiddleware: Prisma.Middleware = async (
    params: Prisma.MiddlewareParams,
    next,
  ) => {
    if (
      params.model !==
      (Prisma.ModelName.Notification ||
        Prisma.ModelName.Enrollment ||
        Prisma.ModelName.CourseTeacher)
    ) {
      if (params.action === 'delete') {
        params.action = 'update';
        params.args['data'] = { deleted: true, deletedAt: new Date() };
      }
      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        params.args['data'] = { deleted: true, deletedAt: new Date() };
      }
    }
    return next(params);
  };

  /** Delete sensitive keys from an object */
  expose<T>(item: T): Expose<T> {
    if (!item) return {} as T;
    if ((item as any as Partial<User>).password)
      (item as any).hasPassword = true;
    delete (item as any as Partial<User>).password;
    return item;
  }
}
