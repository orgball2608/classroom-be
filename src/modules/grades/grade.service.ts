import { CreateGradeDto } from './dto/create-grade.dto';
import { GRADE_MESSAGES } from '@src/constants';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Injectable()
export class GradeService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    userId: number,
    compositionId: number,
    { studentId, grade }: CreateGradeDto,
  ) {
    const gradeData = await this.prisma.grade.create({
      data: {
        student: {
          connect: {
            id: studentId,
          },
        },
        gradeComposition: {
          connect: {
            id: compositionId,
          },
        },
        createdBy: {
          connect: {
            id: userId,
          },
        },
        grade,
      },
    });

    return {
      message: GRADE_MESSAGES.CREATE_GRADE_SUCCESSFULLY,
      data: gradeData,
    };
  }

  findAll() {
    return `This action returns all grade`;
  }

  findOne(id: number) {
    return `This action returns a #${id} grade`;
  }

  update(id: number, updateGradeDto: UpdateGradeDto) {
    return updateGradeDto;
  }

  remove(id: number) {
    return `This action removes a #${id} grade`;
  }
}
