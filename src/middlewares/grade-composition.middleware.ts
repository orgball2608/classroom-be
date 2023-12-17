import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import {
  COURSES_MESSAGES,
  GRADE_COMPOSITIONS_MESSAGES,
} from '@src/constants/message';
import { NextFunction, Response } from 'express';

import { IUserRequest } from '@src/interfaces';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class GradeCompositionMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: IUserRequest, res: Response, next: NextFunction) {
    const path = req.params['0'];
    const parts = path.split('/');
    const courseId = parts[1];
    const courseIdNumber = Number(courseId);

    if (isNaN(courseIdNumber)) {
      throw new BadRequestException(COURSES_MESSAGES.INVALID_COURSE_ID);
    }

    const course = await this.prisma.course.findUnique({
      where: {
        id: courseIdNumber,
      },
    });

    if (!course) {
      throw new NotFoundException(COURSES_MESSAGES.COURSE_NOT_FOUND);
    }

    if (req.user.role !== UserRole.ADMIN && course.status === false) {
      throw new NotFoundException(COURSES_MESSAGES.COURSE_NOT_FOUND);
    }

    const userId = req.user.id;

    const courseTeacher = await this.prisma.courseTeacher.findUnique({
      where: {
        courseId_teacherId: {
          courseId: courseIdNumber,
          teacherId: userId,
        },
      },
    });

    if (!courseTeacher) {
      throw new NotFoundException(
        GRADE_COMPOSITIONS_MESSAGES.YOU_ARE_NOT_PERMISSION_TO_CREATE_GRADE_COMPOSITION,
      );
    }

    next();
  }
}
