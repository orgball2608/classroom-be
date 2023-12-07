import { COURSES_MESSAGES } from '@src/constants/message';
import { CreateCourseDto } from './dto/create-course.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UpdateCourseDto } from './dto/update-course.dto';
import { generateCourseCode } from '@src/common/utils';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}
  async create(userId: number, createCourseDto: CreateCourseDto) {
    const courseCode = generateCourseCode();
    const course = await this.prisma.course.create({
      data: {
        ...createCourseDto,
        code: courseCode,
        year: new Date().getFullYear(),
        createdById: userId,
      },
    });

    return {
      message: COURSES_MESSAGES.COURSES_CREATED_SUCCESSFULLY,
      data: course,
    };
  }

  async findAll() {
    const course = await this.prisma.course.findMany();
    return {
      message: COURSES_MESSAGES.GET_COURSES_SUCCESSFULLY,
      data: course,
    };
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: {
        id,
      },
    });

    return {
      message: COURSES_MESSAGES.GET_COURSE_BY_ID_SUCCESSFULLY,
      data: course,
    };
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const course = await this.prisma.course.update({
      where: {
        id,
      },
      data: {
        ...updateCourseDto,
      },
    });

    return {
      message: COURSES_MESSAGES.UPDATE_COURSE_SUCCESSFULLY,
      data: course,
    };
  }

  async remove(id: number) {
    await this.prisma.course.delete({
      where: {
        id,
      },
    });

    return {
      message: COURSES_MESSAGES.DELETE_COURSE_SUCCESSFULLY,
    };
  }
}
