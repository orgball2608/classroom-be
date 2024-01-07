import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateGradeReviewDto } from './dto/create-grade-review.dto';
import { EMIT_MESSAGES, GRADE_REVIEW_MESSAGES, Order } from '@src/constants';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UpdateGradeReviewDto } from './dto/update-grade-review.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Course, User } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class GradeReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emitterEvent: EventEmitter2,
  ) {}

  async create(
    userId: number,
    gradeId: number,
    createGradeReviewDto: CreateGradeReviewDto,
  ) {
    const gradeReview = await this.prisma.gradeReview.create({
      data: {
        gradeId: gradeId,
        ...createGradeReviewDto,
        createdById: userId,
      },
    });

    return {
      message: GRADE_REVIEW_MESSAGES.CREATED_GRADE_REVIEW_SUCCESSFULLY,
      data: gradeReview,
    };
  }

  findAll() {
    return `This action returns all gradeReview`;
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
    let message;

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

  async markCompleted(reviewId: number) {
    const gradeReview = await this.prisma.gradeReview.update({
      where: {
        id: reviewId,
      },
      data: {
        isResolve: true,
      },
    });

    if (!gradeReview) {
      throw new NotFoundException(GRADE_REVIEW_MESSAGES.GRADE_REVIEW_NOT_FOUND);
    }

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

    const student = await this.prisma.user.findMany({
      where: {
        studentId: createCommentDto.studentId,
      },
    });

    let userIds = [];
    const teacherList = await this.findTeacherInCourse(course.id);

    userIds = [...teacherList.map((t) => t.teacher.id), student[0].id];

    this.emitterEvent.emit(EMIT_MESSAGES.REVIEW_COMMENTED, {
      userIds: userIds,
      comment: commentReview,
    });

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
