import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';

import { COURSES_MESSAGES } from '@src/constants';
import { ICourseRequest } from '@src/interfaces';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class TeacherMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: ICourseRequest, res: Response, next: NextFunction) {
    const teachers = await this.prisma.courseTeacher.findMany({
      where: {
        courseId: req.course.id,
      },
    });

    if (
      req.user.role !== UserRole.ADMIN &&
      !teachers.some((teacher) => teacher.teacherId === req.user.id)
    ) {
      throw new BadRequestException(COURSES_MESSAGES.YOU_ARE_NOT_COURSE_OWNER);
    }

    next();
  }
}
