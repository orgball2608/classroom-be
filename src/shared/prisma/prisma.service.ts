import {
  INestApplication,
  Injectable,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { Expose } from './prisma.interface';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  /** Delete sensitive keys from an object */
  expose<T>(item: T): Expose<T> {
    if (!item) return {} as T;
    if ((item as any as Partial<User>).password)
      (item as any).hasPassword = true;
    delete (item as any as Partial<User>).password;
    return item;
  }
}
