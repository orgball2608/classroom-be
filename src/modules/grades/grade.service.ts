import { Injectable, Logger } from '@nestjs/common';

import { GRADE_MESSAGES } from '@src/constants';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Injectable()
export class GradeService {
  private readonly logger = new Logger(GradeService.name);
  constructor(private readonly prisma: PrismaService) {}
  async updateGrade(
    compositionId: number,
    { studentId, grade }: UpdateGradeDto,
  ) {
    const gradeData = await this.prisma.grade.update({
      where: {
        studentId_gradeCompositionId: {
          studentId,
          gradeCompositionId: compositionId,
        },
      },
      data: {
        grade,
      },
    });

    return {
      message: GRADE_MESSAGES.UPDATE_GRADE_SUCCESSFULLY,
      data: gradeData,
    };
  }

  async findAll(compositionId: number) {
    const grades = await this.prisma.grade.findMany({
      where: {
        gradeCompositionId: compositionId,
      },
    });

    return {
      message: GRADE_MESSAGES.GET_GRADES_SUCCESSFULLY,
      data: grades,
    };
  }

  async remove(id: number) {
    await this.prisma.grade.update({
      where: {
        id,
      },
      data: {
        grade: null,
      },
    });

    return {
      message: GRADE_MESSAGES.REMOVE_GRADE_SUCCESSFULLY,
    };
  }
}
