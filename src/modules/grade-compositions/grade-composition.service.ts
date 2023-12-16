import {
  ApiResponseEntity,
  ApiResponseOmitDataEntity,
} from '@src/common/entity/response.entity';

import { CreateGradeCompositionDto } from './dto/create-grade-composition.dto';
import { GRADE_COMPOSITIONS_MESSAGES } from '@src/constants';
import { GradeCompositionEntity } from './entities/grade-composition.entity';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UpdateGradeCompositionDto } from './dto/update-grade-composition.dto';

@Injectable()
export class GradeCompositionService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    courseId,
    name,
    scale,
  }: CreateGradeCompositionDto): Promise<
    ApiResponseEntity<GradeCompositionEntity>
  > {
    const gradeComposition = await this.prisma.gradeComposition.create({
      data: {
        course: {
          connect: {
            id: courseId,
          },
        },
        name,
        scale,
      },
    });

    return {
      message:
        GRADE_COMPOSITIONS_MESSAGES.CREATE_GRADE_COMPOSITION_SUCCESSFULLY,
      data: gradeComposition,
    };
  }

  async findAll(): Promise<ApiResponseEntity<GradeCompositionEntity[]>> {
    const gradeCompositions = await this.prisma.gradeComposition.findMany();
    return {
      message:
        GRADE_COMPOSITIONS_MESSAGES.GET_LIST_GRADE_COMPOSITION_SUCCESSFULLY,
      data: gradeCompositions,
    };
  }

  async findOne(
    id: number,
  ): Promise<ApiResponseEntity<GradeCompositionEntity>> {
    const gradeComposition = await this.prisma.gradeComposition.findUnique({
      where: {
        id,
      },
    });

    return {
      message: GRADE_COMPOSITIONS_MESSAGES.GET_GRADE_COMPOSITION_SUCCESSFULLY,
      data: gradeComposition,
    };
  }

  async update(
    id: number,
    updateGradeCompositionDto: UpdateGradeCompositionDto,
  ): Promise<ApiResponseEntity<GradeCompositionEntity>> {
    const { name, scale } = updateGradeCompositionDto;
    const gradeComposition = await this.prisma.gradeComposition.update({
      where: {
        id,
      },
      data: {
        name,
        scale,
      },
    });

    return {
      message:
        GRADE_COMPOSITIONS_MESSAGES.UPDATE_GRADE_COMPOSITION_SUCCESSFULLY,
      data: gradeComposition,
    };
  }

  async remove(id: number): Promise<ApiResponseOmitDataEntity> {
    await this.prisma.gradeComposition.update({
      where: {
        id,
      },
      data: {
        status: false,
      },
    });

    return {
      message:
        GRADE_COMPOSITIONS_MESSAGES.DELETE_GRADE_COMPOSITION_SUCCESSFULLY,
    };
  }
}
