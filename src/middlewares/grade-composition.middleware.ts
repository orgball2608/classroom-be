import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';

import { GRADE_COMPOSITION_MESSAGES } from '@src/constants';
import { IGradeCompositionRequest } from '@src/interfaces';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class GradeCompositionMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: IGradeCompositionRequest, res: Response, next: NextFunction) {
    const gradeCompositionId = req.params.id;
    const gradeCompositionIdNumber = Number(gradeCompositionId);

    if (isNaN(gradeCompositionIdNumber)) {
      throw new BadRequestException(
        GRADE_COMPOSITION_MESSAGES.INVALID_GRADE_COMPOSITION_ID,
      );
    }

    const gradeComposition = await this.prisma.gradeComposition.findUnique({
      where: {
        id: gradeCompositionIdNumber,
      },
    });

    if (!gradeComposition) {
      throw new BadRequestException(
        GRADE_COMPOSITION_MESSAGES.GRADE_COMPOSITION_NOT_FOUND,
      );
    }

    if (req.user.role !== UserRole.ADMIN && gradeComposition.deleted === true) {
      throw new NotFoundException(
        GRADE_COMPOSITION_MESSAGES.GRADE_COMPOSITION_NOT_FOUND,
      );
    }

    req.gradeComposition = gradeComposition;

    next();
  }
}
