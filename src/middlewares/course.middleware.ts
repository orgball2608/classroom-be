// import { Injectable, NestMiddleware, BadRequestException, NextFunction} from '@nestjs/common';
import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { COURSES_MESSAGES } from '@src/constants/message';

@Injectable()
export class CourseMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    console.log('CourseMiddleware');

    const courseId = req.params.id;
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

    next();
  }
}
