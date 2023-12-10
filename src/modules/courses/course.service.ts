import { COURSES_MESSAGES, USERS_MESSAGES } from '@src/constants/message';
import { CreateCourseDto } from './dto/create-course.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { StorageService } from '@src/shared/storage/services/storage.service';
import { UpdateCourseDto } from './dto/update-course.dto';
import { generateCourseCode } from '@src/common/utils';
import { v4 as uuid4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CourseService {
  constructor(
    private prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
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
    const course = await this.prisma.course.findMany({
      where: {
        id,
      },
      select: {
        students: {
          select: {
            student: {
              select: {
                id: true,
                email: true,
                avatar: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
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

  async enrollToCourse(userId: number, courseId: number) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const enrollment = await this.prisma.enrollment.create({
      data: {
        course: {
          connect: {
            id: courseId,
          },
        },
        createdBy: String(
          course.createdBy.firstName + ' ' + course.createdBy.lastName,
        ),
        student: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return {
      message: COURSES_MESSAGES.ENROLLED_TO_COURSE_SUCCESSFULLY,
      data: enrollment,
    };
  }

  async inviteByEmail(
    email: string,
    courseId: number,
    role: string,
    fullName: string,
  ) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    const user = await this.prisma.course.findUnique({
      where: {
        id: courseId,
        OR: [
          {
            students: {
              some: {
                student: {
                  email: email,
                },
              },
            },
          },
          {
            teachers: {
              some: {
                email: email,
              },
            },
          },
        ],
      },
    });

    if (!course) {
      throw new NotFoundException(COURSES_MESSAGES.COURSE_NOT_FOUND);
    } else if (user) {
      throw new BadRequestException(COURSES_MESSAGES.USER_ENROLLED_COURSE);
    }

    const Role = role === 'student' ? 'học sinh' : 'giáo viên';

    const verifyEmailToken = this.signJoinCourseToken(email, courseId, role);
    const inviteLink = `${process.env.FRONTEND_URL}/class/join?token=${verifyEmailToken}`;

    return this.mailerService.sendMail({
      to: email,
      from: 'elearningapp@gmail.com',
      subject: 'Lời Mời Tham gia lớp học',
      template: './invitation-email.hbs',
      context: {
        name: fullName,
        inviteLink: inviteLink,
        className: course.name,
        role: Role,
      },
    });
  }

  private signJoinCourseToken(email: string, courseId: number, role: string) {
    return this.jwtService.sign(
      {
        email,
        courseId,
        role,
      },
      {
        secret: this.config.get('auth.jwtMailSecret'),
        expiresIn: 315360000,
      },
    );
  }

  async verifyInvitationEmailToken(id: number, token: string) {
    const { email, courseId, role } = this.jwtService.verify(token, {
      secret: this.config.get('auth.jwtMailSecret'),
    });
    console.log(email);

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);
    }

    if (role === 'student') {
      const enrollment = await this.prisma.enrollment.create({
        data: {
          course: {
            connect: {
              id: courseId,
            },
          },
          createdBy: String(
            course.createdBy.firstName + ' ' + course.createdBy.lastName,
          ),
          student: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      console.log(course);

      return {
        message: COURSES_MESSAGES.ENROLLED_TO_COURSE_SUCCESSFULLY,
        data: enrollment,
      };
    }

    if (role === 'teacher') {
      const course = await this.prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          teachers: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      console.log(course);

      return {
        message: COURSES_MESSAGES.ENROLLED_TO_COURSE_SUCCESSFULLY,
        data: course,
      };
    }

    return {
      message: COURSES_MESSAGES.ENROLLED_TO_COURSE_SUCCESSFULLY,
    };
  }
}
