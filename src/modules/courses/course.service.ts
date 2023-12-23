import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { COURSES_MESSAGES, USERS_MESSAGES } from '@src/constants/message';
import { Course, CourseTeacher, User } from '@prisma/client';

import { ConfigService } from '@nestjs/config';
import { CreateCourseDto } from './dto/create-course.dto';
import { EMIT_MESSAGES } from '@src/constants';
import { EnrollmentRole } from './course.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { StorageService } from '@src/shared/storage/services/storage.service';
import { UpdateCourseDto } from './dto/update-course.dto';
import { generateCourseCode } from '@src/common/utils';
import { v4 as uuid4 } from 'uuid';

@Injectable()
export class CourseService {
  constructor(
    private readonly storageService: StorageService,
    private readonly mailerService: MailerService,
    private readonly emitterEvent: EventEmitter2,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private prisma: PrismaService,
  ) {}
  async create(userId: number, createCourseDto: CreateCourseDto) {
    const courseCode = generateCourseCode();
    const course = await this.prisma.course.create({
      data: {
        ...createCourseDto,
        code: courseCode,
        year: new Date().getFullYear(),
        createdById: userId,
        courseTeachers: {
          create: {
            teacher: {
              connect: {
                id: userId,
              },
            },
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
        courseTeachers: {
          some: {
            teacherId: teacherId,
          },
        },
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
        enrollments: {
          some: {
            studentId: studentId,
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

  async findAllUserInCourse(userId: number) {
    const course = await this.prisma.course.findMany({
      where: {
        id: userId,
      },
      include: {
        enrollments: {
          select: {
            student: {
              select: {
                id: true,
                email: true,
                avatar: true,
                firstName: true,
                lastName: true,
                address: true,
                phoneNumber: true,
                studentId: true,
              },
            },
          },
        },
        courseTeachers: {
          select: {
            teacher: {
              select: {
                id: true,
                email: true,
                avatar: true,
                firstName: true,
                lastName: true,
                address: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    return {
      message: COURSES_MESSAGES.GET_USERS_IN_COURSE_SUCCESSFULLY,
      data: course,
    };
  }

  async findAllCourseOfMe(userId: number) {
    const courses = await this.prisma.course.findMany({
      where: {
        deleted: false,
        OR: [
          {
            enrollments: {
              some: {
                studentId: userId,
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
        enrollments: {
          select: {
            studentId: true,
            createdAt: true,
          },
        },
        courseTeachers: {
          select: {
            teacherId: true,
            createdAt: true,
          },
        },
      },
    });

    courses
      .map((course) => {
        if (
          course.courseTeachers.some((teacher) => teacher.teacherId === userId)
        ) {
          const joinedAt = course.courseTeachers.find(
            (teacher) => teacher.teacherId === userId,
          ).createdAt;
          return {
            ...course,
            joinedAt: joinedAt,
          };
        } else {
          const joinedAt = course.enrollments.find(
            (enrollment) => enrollment.studentId === userId,
          ).createdAt;
          return {
            ...course,
            joinedAt: joinedAt,
          };
        }
      })
      .sort((a: any, b: any) => a.joinedAt - b.joinedAt);

    return {
      message: COURSES_MESSAGES.GET_COURSES_ENROLLED_SUCCESSFULLY,
      data: courses,
    };
  }

  async enrollToCourse(user: User, course: Course, courseId: number) {
    const enrollment = await this.prisma.enrollment.create({
      data: {
        course: {
          connect: {
            id: courseId,
          },
        },
        createdBy: {
          connect: {
            id: course.createdById,
          },
        },
        student: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    const notificationData = {
      userId: course.createdById,
      title: 'New enrollment to your course',
      body: `${user.firstName} ${user.lastName} enrolled to course ${course.name}`,
    };

    this.emitterEvent.emit(EMIT_MESSAGES.NOTIFICATION_CREATED, {
      userId: course.createdById,
      notificationData,
    });

    return {
      message: COURSES_MESSAGES.ENROLLED_TO_COURSE_SUCCESSFULLY,
      data: enrollment,
    };
  }

  async checkCourse(courseId: number) {
    const course = await this.findOne(courseId);
    if (!course) {
      throw new NotFoundException(COURSES_MESSAGES.COURSE_NOT_FOUND);
    }
    return course.data;
  }

  async leaveCourse(userId: number, course: Course, courseId: number) {
    if (course.createdById === userId) {
      throw new ForbiddenException(
        COURSES_MESSAGES.YOU_ARE_OWNER_OF_THIS_COURSE_CAN_NOT_LEAVE,
      );
    }

    const enrollment = await this.prisma.course.findUnique({
      where: {
        id: courseId,
        OR: [
          {
            enrollments: {
              some: {
                studentId: userId,
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
      include: {
        courseTeachers: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException(
        COURSES_MESSAGES.YOU_NOT_ENROLLED_IN_THIS_COURSE,
      );
    }

    if (
      enrollment.courseTeachers.some(
        (teacher: CourseTeacher): boolean => teacher.teacherId === userId,
      )
    ) {
      await this.prisma.courseTeacher.delete({
        where: {
          courseId_teacherId: {
            courseId: courseId,
            teacherId: userId,
          },
        },
      });
    } else {
      await this.prisma.enrollment.delete({
        where: {
          studentId_courseId: {
            courseId: courseId,
            studentId: userId,
          },
        },
      });
    }

    return {
      message: COURSES_MESSAGES.LEAVE_COURSE_SUCCESSFULLY,
    };
  }

  async inviteByEmail(
    email: string,
    courseId: number,
    role: EnrollmentRole,
    fullName: string,
  ) {
    const course = await this.checkCourse(courseId);
    const user = await this.prisma.course.findUnique({
      where: {
        id: courseId,
        OR: [
          {
            enrollments: {
              some: {
                student: {
                  email: email,
                },
              },
            },
          },
          {
            courseTeachers: {
              some: {
                teacher: {
                  email: email,
                },
              },
            },
          },
        ],
      },
    });

    if (user) {
      throw new BadRequestException(COURSES_MESSAGES.USER_ENROLLED_COURSE);
    }

    const enrollmentRole =
      role === EnrollmentRole.STUDENT ? 'student' : 'teacher';

    const verifyEmailToken = this.signJoinCourseToken(email, courseId, role);
    const inviteLink = `${process.env.FRONTEND_URL}/class/join?token=${verifyEmailToken}`;

    return this.mailerService.sendMail({
      to: email,
      from: 'elearningapp@gmail.com',
      subject: 'Invitation to join the class',
      template: './invitation-email.hbs',
      context: {
        name: fullName,
        inviteLink: inviteLink,
        className: course.name,
        role: enrollmentRole,
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
        secret: this.config.get<string>('auth.jwtMailSecret'),
        expiresIn: this.config.get<number>('auth.jwtMailExpires'),
      },
    );
  }

  async verifyInvitationEmailToken(userId: number, token: string) {
    try {
      const { email, courseId, role } = this.jwtService.verify(token, {
        secret: this.config.get('auth.jwtMailSecret'),
      });

      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new NotFoundException(USERS_MESSAGES.USER_NOT_FOUND);
      }

      if (user.id !== userId) {
        throw new ForbiddenException(
          COURSES_MESSAGES.ACCOUNT_ENROLL_NOT_CORRECT_WITH_LOGIN_ACCOUNT,
        );
      }

      const course = await this.checkCourse(courseId);

      const userCourse = await this.prisma.course.findUnique({
        where: {
          id: courseId,
          OR: [
            {
              enrollments: {
                some: {
                  student: {
                    email: email,
                  },
                },
              },
            },
            {
              courseTeachers: {
                some: {
                  teacher: {
                    email: email,
                  },
                },
              },
            },
          ],
        },
      });

      if (userCourse) {
        return {
          message: COURSES_MESSAGES.ENROLLED_TO_COURSE_SUCCESSFULLY,
          data: course,
        };
      }

      if (role === EnrollmentRole.STUDENT) {
        const result = await this.enrollToCourse(user, course, courseId);
        return result;
      }

      if (role === EnrollmentRole.TEACHER) {
        const result = await this.prisma.courseTeacher.create({
          data: {
            course: {
              connect: {
                id: courseId,
              },
            },
            teacher: {
              connect: {
                id: user.id,
              },
            },
          },
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                description: true,
                avatar: true,
                createdBy: true,
              },
            },
          },
        });

        const notificationData = {
          userId: course.createdBy,
          title: 'New enrollment to your course',
          body: `${user.firstName} ${user.lastName} enrolled to course ${course.name}`,
        };

        this.emitterEvent.emit(EMIT_MESSAGES.NOTIFICATION_CREATED, {
          userId: course.createdById,
          notificationData,
        });

        return {
          message: COURSES_MESSAGES.ENROLLED_TO_COURSE_SUCCESSFULLY,
          data: result,
        };
      }

      return {
        message: COURSES_MESSAGES.ENROLLED_TO_COURSE_SUCCESSFULLY,
      };
    } catch (error) {
      throw new BadRequestException(COURSES_MESSAGES.INVALID_TOKEN);
    }
  }

  async removeUserInCourse(userId: number, course: Course, courseId: number) {
    const result = await this.leaveCourse(userId, course, courseId);
    result.message = COURSES_MESSAGES.REMOVE_USER_IN_COURSE_SUCCESSFULLY;
    return result;
  }
}
