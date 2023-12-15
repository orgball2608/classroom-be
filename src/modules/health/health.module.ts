import { HealthController } from './health.controller';
import { Module } from '@nestjs/common';
import { PrismaOrmHealthIndicator } from '@src/shared/prisma/prisma.health';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrismaOrmHealthIndicator],
})
export class HealthModule {}
