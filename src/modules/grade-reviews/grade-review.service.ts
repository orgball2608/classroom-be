import { Course, User } from '@prisma/client';
import { EMIT_MESSAGES, GRADE_REVIEW_MESSAGES, Order } from '@src/constants';
import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateGradeReviewDto } from './dto/create-grade-review.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { INotification } from '@src/interfaces';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UpdateGradeReviewDto } from './dto/update-grade-review.dto';

@Injectable()
export class GradeReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emitterEvent: EventEmitter2,
  ) {}

  async create(
    user: User,
    gradeId: number,
    createGradeReviewDto: CreateGradeReviewDto,
  ) {
    const gradeReview = await this.prisma.gradeReview.create({
      data: {
        gradeId: gradeId,
        ...createGradeReviewDto,
        createdById: user.id,
      },
      include: {
        grade: {
          select: {
            createdBy: {
              select: {
                id: true,
                email: true,
                avatar: true,
                firstName: true,
                lastName: true,
                studentId: true,
              },
            },
            gradeComposition: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const notificationData: INotification = {
      userId: gradeReview.grade.createdBy.id,
      creatorId: user.id,
      title: 'Student review grade composition created',
      body: `${user.firstName} ${user.lastName} created review for grade composition ${gradeReview.grade.gradeComposition.name}.`,
    };

    this.emitterEvent.emit(EMIT_MESSAGES.NOTIFICATION_CREATED, {
      userId: gradeReview.grade.createdBy.id,
      notificationData,
    });

    return {
      message: GRADE_REVIEW_MESSAGES.CREATED_GRADE_REVIEW_SUCCESSFULLY,
      data: gradeReview,
    };
  }

  async findOne(id: number) {
    const gradeReview = await this.prisma.gradeReview.findUnique({
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
            studentId: true,
          },
        },
      },
    });

    if (!gradeReview)
      throw new NotFoundException(GRADE_REVIEW_MESSAGES.GRADE_REVIEW_NOT_FOUND);

    return {
      message: GRADE_REVIEW_MESSAGES.GET_GRADE_REVIEW_BY_ID_SUCCESSFULLY,
      data: gradeReview,
    };
  }

  async update(id: number, updateGradeReviewDto: UpdateGradeReviewDto) {
    const gradeReview = await this.prisma.gradeReview.update({
      where: {
        id,
      },
      data: updateGradeReviewDto,
    });

    return {
      message: GRADE_REVIEW_MESSAGES.UPDATE_GRADE_REVIEW_SUCCESSFULLY,
      data: gradeReview,
    };
  }

  async remove(id: number) {
    const gradeReview = await this.prisma.gradeReview.delete({
      where: {
        id,
      },
    });

    return {
      message: GRADE_REVIEW_MESSAGES.DELETE_GRADE_REVIEW_SUCCESSFULLY,
      data: gradeReview,
    };
  }

  async getListReview(courseId: number) {
    let message: string;

    const data = [];

    const gradeCompositions = await this.prisma.gradeComposition.findMany({
      where: {
        courseId: courseId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const grades = await this.prisma.grade.findMany({
      where: {
        gradeCompositionId: {
          in: gradeCompositions.map((gc) => gc.id),
        },
        grade: {
          not: null,
        },
      },
      include: {
        gradeComposition: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const gradeReview = await this.prisma.gradeReview.findMany({
      where: {
        gradeId: {
          in: grades.map((gc) => gc.id),
        },
      },
      orderBy: {
        createdAt: Order.ASC,
      },
    });

    const enrollment = await this.prisma.enrollment.findMany({
      where: {
        courseId: courseId,
        studentId: {
          in: grades.map((gc) => gc.studentId),
        },
      },
      select: {
        studentId: true,
        fullName: true,
        courseId: true,
      },
    });

    gradeReview.map((review) => {
      const grade = grades.find((g) => g.id === review.gradeId);
      const student = enrollment.find((e) => e.studentId === grade.studentId);
      data.push({
        id: review.id,
        gradeId: grade.id,
        studentId: grade.studentId,
        fullName: student.fullName,
        gradeName: grade.gradeComposition.name,
        grade: grade.grade,
        expectedGrade: review.expectedGrade,
        explanation: review.explanation,
        createdAt: review.createdAt,
        isResolve: review.isResolve,
        courseId: student.courseId,
        compositionId: grade.gradeCompositionId,
      });
    });

    return {
      message,
      data,
    };
  }

  async markCompleted(user: User, reviewId: number) {
    const gradeReview = await this.prisma.gradeReview.update({
      where: {
        id: reviewId,
      },
      data: {
        isResolve: true,
      },
      select: {
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

    if (!gradeReview) {
      throw new NotFoundException(GRADE_REVIEW_MESSAGES.GRADE_REVIEW_NOT_FOUND);
    }

    const notificationData: INotification = {
      userId: gradeReview.createdBy.id,
      creatorId: user.id,
      title: 'Teacher marked grade composition finalized',
      body: `${user.firstName} ${user.lastName} marked final decision for your grade composition review`,
    };

    this.emitterEvent.emit(EMIT_MESSAGES.NOTIFICATION_CREATED, {
      userId: gradeReview.createdBy.id,
      notificationData,
    });

    return {
      message: GRADE_REVIEW_MESSAGES.MARK_COMPLETED_GRADE_REVIEW_SUCCESSFULLY,
      data: gradeReview,
    };
  }

  async markInComplete(reviewId: number) {
    const gradeReview = await this.prisma.gradeReview.update({
      where: {
        id: reviewId,
      },
      data: {
        isResolve: false,
      },
    });

    if (!gradeReview) {
      throw new NotFoundException(GRADE_REVIEW_MESSAGES.GRADE_REVIEW_NOT_FOUND);
    }

    return {
      message: GRADE_REVIEW_MESSAGES.MARK_INCOMPLETE_GRADE_REVIEW_SUCCESSFULLY,
      data: gradeReview,
    };
  }

  async findTeacherInCourse(courseId: number) {
    const teacherList = await this.prisma.courseTeacher.findMany({
      where: {
        courseId: courseId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            email: true,
            avatar: true,
            firstName: true,
            lastName: true,
            address: true,
            phoneNumber: true,
            createdAt: true,
          },
        },
      },
    });

    return teacherList;
  }

  async createComment(
    reviewId: number,
    createCommentDto: CreateCommentDto,
    user: User,
    course: Course,
  ) {
    const commentReview = await this.prisma.reviewComment.create({
      data: {
        reviewId: reviewId,
        body: createCommentDto.body,
        createdById: user.id,
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

    if (!commentReview) {
      throw new NotFoundException(GRADE_REVIEW_MESSAGES.GRADE_REVIEW_NOT_FOUND);
    }

    const student = await this.prisma.user.findUnique({
      where: {
        studentId: createCommentDto.studentId,
      },
    });

    const teacherList = await this.findTeacherInCourse(course.id);

    const userIds = [...teacherList.map((t) => t.teacher.id), student.id];

    //Realtime comment
    userIds.forEach((userId: number) => {
      this.emitterEvent.emit(EMIT_MESSAGES.REVIEW_COMMENTED, {
        userId: userId,
        comment: commentReview,
      });
    });

    //Send notification
    if (user.id != commentReview.createdBy.id) {
      const notificationData: INotification = {
        userId: commentReview.createdBy.id,
        creatorId: user.id,
        title: 'New comment on grade review',
        body: `${user.firstName} ${user.lastName} created a comment on your grade review`,
      };

      this.emitterEvent.emit(EMIT_MESSAGES.NOTIFICATION_CREATED, {
        userId: commentReview.createdBy.id,
        notificationData,
      });
    } else {
      const notificationData: INotification = {
        userId: course.createdById,
        creatorId: user.id,
        title: 'New comment on grade review of your course',
        body: `${user.firstName} ${user.lastName} created a comment on grade review of your course`,
      };

      this.emitterEvent.emit(EMIT_MESSAGES.NOTIFICATION_CREATED, {
        userId: course.createdById,
        notificationData,
      });
    }

    return {
      message: GRADE_REVIEW_MESSAGES.MARK_INCOMPLETE_GRADE_REVIEW_SUCCESSFULLY,
      data: commentReview,
    };
  }

  async getCommentList(reviewId: number) {
    await this.findOne(reviewId);

    const reviewComment = await this.prisma.reviewComment.findMany({
      where: {
        reviewId: reviewId,
      },
      orderBy: {
        createdAt: Order.ASC,
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
      message: GRADE_REVIEW_MESSAGES.GET_COMMENT_LIST_SUCCESSFULLY,
      data: reviewComment,
    };
  }
}
