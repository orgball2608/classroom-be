import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';

import { COURSES_MESSAGES } from '@src/constants/message';
import { ICourseRequest } from '@src/interfaces';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class CourseMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: ICourseRequest, res: Response, next: NextFunction) {
    console.log('CourseMiddleware');
    const courseId = req.params.courseId || req.params.id;
    const courseIdNumber = Number(courseId);

    if (isNaN(courseIdNumber)) {
      throw new BadRequestException(COURSES_MESSAGES.INVALID_COURSE_ID);
    }

    const course = await this.prisma.course.findUnique({
      where: {
        id: courseIdNumber,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(COURSES_MESSAGES.COURSE_NOT_FOUND);
    }

    if (req.user.role !== UserRole.ADMIN && course.deleted === true) {
      throw new NotFoundException(COURSES_MESSAGES.COURSE_NOT_FOUND);
    }

    const userId = req.user.id;

    const enrollment = await this.prisma.course.findUnique({
      where: {
        id: courseIdNumber,
        OR: [
          {
            enrollments: {
              some: {
                userId: userId,
              },
            },
          },
          {
            courseTeachers: {
              some: {
                teacherId: userId,
              },
            },
          },
        ],
      },
    });

    if (
      !enrollment &&
      !req.url.includes('checkEnrolled') &&
      !req.url.includes('enroll')
    ) {
      throw new NotFoundException(COURSES_MESSAGES.COURSE_NOT_FOUND);
    }

    req.isEnrolled = enrollment !== null;
    req.course = course;
    next();
  }
}
