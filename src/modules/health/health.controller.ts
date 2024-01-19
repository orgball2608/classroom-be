import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { ApiTags } from '@nestjs/swagger';
import { PrismaOrmHealthIndicator } from '@src/shared/prisma/prisma.health';
import { ROUTES } from '@src/constants';

@Controller(ROUTES.HEALTH)
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
