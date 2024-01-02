import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { NextFunction, Response } from 'express';

import { GRADE_MESSAGES } from '@src/constants';
import { IGradeRequest } from '@src/interfaces';
import { PrismaService } from '@src/shared/prisma/prisma.service';

@Injectable()
export class GradeMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: IGradeRequest, res: Response, next: NextFunction) {
    console.log('GradeMiddleware', req.params);
    const gradeId = req.params.gradeId || req.params.id;
    const gradeIdNumber = Number(gradeId);

    console.log('gradeIdNumber', gradeId);

    const grade = await this.prisma.grade.findUnique({
      where: {
        id: gradeIdNumber,
      },
    });

    if (!grade) {
      throw new NotFoundException(GRADE_MESSAGES.GRADE_NOT_FOUND);
    }

    req.grade = grade;

    next();
  }
}
