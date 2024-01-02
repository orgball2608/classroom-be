import { CreateGradeReviewDto } from './dto/create-grade-review.dto';
import { GRADE_REVIEW_MESSAGES } from '@src/constants';
import { Injectable } from '@nestjs/common';
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
    });

    if (!gradeReview) {
      return {
        message: GRADE_REVIEW_MESSAGES.GRADE_REVIEW_NOT_FOUND,
      };
    }

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
}
