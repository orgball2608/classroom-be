import { Global, Module } from '@nestjs/common';

import { PrismaOrmHealthIndicator } from './prisma.health';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService, PrismaOrmHealthIndicator],
  exports: [PrismaService, PrismaOrmHealthIndicator],
})
export class PrismaModule {}
