import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { GRADE_COMPOSITION_MESSAGES } from '@src/constants';
import { Observable } from 'rxjs';
import { PrismaService } from '@src/shared/prisma/prisma.service';

@Injectable()
export class FinalizedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('Grade composition finalized guard');

    if (!request.gradeComposition.isFinalized) {
      throw new BadRequestException(
        GRADE_COMPOSITION_MESSAGES.GRADE_COMPOSITION_IS_NOT_FINALIZED,
      );
    }

    return true;
  }
}
