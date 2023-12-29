import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';

import { GRADE_COMPOSITION_MESSAGES } from '@src/constants';
import { IGradeRequest } from '@src/interfaces';
import { PrismaService } from '@src/shared/prisma/prisma.service';

@Injectable()
export class GradeMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: IGradeRequest, res: Response, next: NextFunction) {
    if (!req.gradeComposition.isFinalized) {
      throw new BadRequestException(
        GRADE_COMPOSITION_MESSAGES.GRADE_COMPOSITION_IS_NOT_FINALIZED,
      );
    }

    //TO DO: refactor if have more business logic

    next();
  }
}
