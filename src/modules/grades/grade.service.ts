import { GRADE_MESSAGES } from '@src/constants';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Injectable()
export class GradeService {
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

  remove(id: number) {
    return `This action removes a #${id} grade`;
  }
}
