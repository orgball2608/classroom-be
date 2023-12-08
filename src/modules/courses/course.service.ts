import { COURSES_MESSAGES } from '@src/constants/message';
import { CreateCourseDto } from './dto/create-course.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { StorageService } from '@src/shared/storage/services/storage.service';
import { UpdateCourseDto } from './dto/update-course.dto';
import { generateCourseCode } from '@src/common/utils';
import { v4 as uuid4 } from 'uuid';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}
  async create(userId: number, createCourseDto: CreateCourseDto) {
    const courseCode = generateCourseCode();
    const course = await this.prisma.course.create({
      data: {
        ...createCourseDto,
        code: courseCode,
        year: new Date().getFullYear(),
        createdById: userId,
        teachers: {
          connect: {
            id: userId,
          },
        },
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

  async findAllCourseByTeacherId(teacherId: number) {
    const courses = await this.prisma.course.findMany({
      where: {
        createdById: teacherId,
      },
    });

    return {
      message: COURSES_MESSAGES.GET_COURSES_BY_TEACHER_ID_SUCCESSFULLY,
      data: courses,
    };
  }

  async findAllCourseByStudentId(studentId: number) {
    const courses = await this.prisma.course.findMany({
      where: {
        students: {
          some: {
            id: studentId,
          },
        },
      },
    });

    return {
      message: COURSES_MESSAGES.GET_COURSES_ENROLLED_SUCCESSFULLY,
      data: courses,
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

  async updateCourseImage(id: number, avatar: Express.Multer.File) {
    const updatedCourse = await this.prisma.$transaction(async (tx) => {
      const key = uuid4();

      const avatarURL = await this.storageService.uploadFile({
        key,
        file: avatar,
      });

      return tx.course.update({
        where: {
          id,
        },
        data: {
          avatar: avatarURL,
        },
      });
    });

    return {
      message: COURSES_MESSAGES.UPDATE_COURSE_IMAGE_SUCCESSFULLY,
      data: updatedCourse,
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

  async findAllUserInCourse(id: number) {
    const course = await this.prisma.course.findUnique({
      where: {
        id,
      },
      select: {
        students: true,
        teachers: {
          select: {
            id: true,
            email: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      message: COURSES_MESSAGES.GET_USERS_IN_COURSE_SUCCESSFULLY,
      data: course,
    };
  }

  async findAllCourseOfMe(id: number) {
    const courses = await this.prisma.course.findMany({
      where: {
        OR: [
          {
            students: {
              some: {
                id: id,
              },
            },
          },
          {
            teachers: {
              some: {
                id: id,
              },
            },
          },
        ],
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      message: COURSES_MESSAGES.GET_COURSES_ENROLLED_SUCCESSFULLY,
      data: courses,
    };
  }
}
