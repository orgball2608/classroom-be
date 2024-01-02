import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { COURSES_MESSAGES } from '@src/constants';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class TeacherGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('Teacher guard');

    const teachers = await this.prisma.courseTeacher.findMany({
      where: {
        courseId: request.course.id,
      },
    });

    if (
      request.user.role !== UserRole.ADMIN &&
      !teachers.some((teacher) => teacher.teacherId === request.user.id)
    ) {
      throw new BadRequestException(COURSES_MESSAGES.YOU_ARE_NOT_COURSE_OWNER);
    }

    return true;
  }
}
