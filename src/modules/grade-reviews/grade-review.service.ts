import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateGradeReviewDto } from './dto/create-grade-review.dto';
import { GRADE_REVIEW_MESSAGES, Order } from '@src/constants';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UpdateGradeReviewDto } from './dto/update-grade-review.dto';

@Injectable()
export class GradeReviewService {
  constructor(private readonly prisma: PrismaService) {}

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
}
