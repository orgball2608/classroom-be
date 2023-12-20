import {
  ApiResponseEntity,
  ApiResponseOmitDataEntity,
} from '@src/common/entity/response.entity';
import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateGradeCompositionDto } from './dto/create-grade-composition.dto';
import { GRADE_COMPOSITION_MESSAGES } from '@src/constants';
import { GradeCompositionEntity } from './entities/grade-composition.entity';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { SimpleUserEntity } from '@src/common/entity/simple-user.entity';
import { UpdateGradeCompositionDto } from './dto/update-grade-composition.dto';
import { User } from '@prisma/client';

@Injectable()
export class GradeCompositionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    user: User,
    courseId: number,
    { name, scale }: CreateGradeCompositionDto,
  ): Promise<ApiResponseEntity<GradeCompositionEntity>> {
    const gradeCompositions = await this.prisma.gradeComposition.findMany({
      where: {
        courseId,
      },
    });

    const totalScale = gradeCompositions.reduce(
      (total, gradeComposition) => total + gradeComposition.scale,
      0,
    );

    const maxIndex = Math.max(...gradeCompositions.map((gc) => gc.index), 0);

    if (
      totalScale + scale > 100 ||
      gradeCompositions.find(
        (gradeComposition) =>
          gradeComposition.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      throw new BadRequestException(
        GRADE_COMPOSITION_MESSAGES.INVALID_GRADE_COMPOSITION,
      );
    }

    const gradeComposition = await this.prisma.gradeComposition.create({
      data: {
        course: {
          connect: {
            id: courseId,
          },
        },
        createdBy: {
          connect: {
            id: user.id,
          },
        },
        name,
        scale,
        index: maxIndex + 1,
      },
    });

    return {
      message: GRADE_COMPOSITION_MESSAGES.CREATE_GRADE_COMPOSITION_SUCCESSFULLY,
      data: gradeComposition,
    };
  }

  async findAllByCourseId(courseId: number) {
    const gradeCompositions = await this.prisma.gradeComposition.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: {
        index: 'desc',
      },
    });
    return {
      message:
        GRADE_COMPOSITION_MESSAGES.GET_GRADE_COMPOSITION_BY_COURSE_ID_SUCCESSFULLY,
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
      include: {
        createdBy: true,
      },
    });

    return {
      message: GRADE_COMPOSITION_MESSAGES.GET_GRADE_COMPOSITION_SUCCESSFULLY,
      data: {
        ...gradeComposition,
        createdBy: new SimpleUserEntity(gradeComposition.createdBy),
      },
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
      message: GRADE_COMPOSITION_MESSAGES.UPDATE_GRADE_COMPOSITION_SUCCESSFULLY,
      data: gradeComposition,
    };
  }

  async remove(id: number): Promise<ApiResponseOmitDataEntity> {
    await this.prisma.gradeComposition.delete({
      where: {
        id,
      },
    });

    return {
      message: GRADE_COMPOSITION_MESSAGES.DELETE_GRADE_COMPOSITION_SUCCESSFULLY,
    };
  }

  async switchGradeCompositionIndex(firstId: number, secondId: number) {
    const firstIndex = await this.prisma.gradeComposition.findUnique({
      where: {
        id: firstId,
      },
      select: {
        index: true,
      },
    });

    if (!firstIndex) {
      throw new BadRequestException(
        GRADE_COMPOSITION_MESSAGES.INVALID_GRADE_COMPOSITION,
      );
    }

    const secondIndex = await this.prisma.gradeComposition.findUnique({
      where: {
        id: secondId,
      },
      select: {
        index: true,
      },
    });

    if (!secondIndex) {
      throw new BadRequestException(
        GRADE_COMPOSITION_MESSAGES.INVALID_GRADE_COMPOSITION,
      );
    }

    await this.prisma.$transaction([
      this.prisma.gradeComposition.update({
        where: {
          id: secondId,
        },
        data: {
          index: null,
        },
      }),

      this.prisma.gradeComposition.update({
        where: {
          id: firstId,
        },
        data: {
          index: secondIndex.index,
        },
      }),

      this.prisma.gradeComposition.update({
        where: {
          id: secondId,
        },
        data: {
          index: firstIndex.index,
        },
      }),
    ]);

    return {
      message:
        GRADE_COMPOSITION_MESSAGES.SWITCH_GRADE_COMPOSITION_INDEX_SUCCESSFULLY,
    };
  }
}
