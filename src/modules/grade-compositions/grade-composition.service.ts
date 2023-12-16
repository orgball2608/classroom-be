import { CreateGradeCompositionDto } from './dto/create-grade-composition.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UpdateGradeCompositionDto } from './dto/update-grade-composition.dto';

@Injectable()
export class GradeCompositionService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ courseId, name, scale }: CreateGradeCompositionDto) {
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
      message: 'Grade struct created successfully',
      data: gradeComposition,
    };
  }

  findAll() {
    return `This action returns all gradeComposition`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gradeComposition`;
  }

  update(id: number, updateGradeCompositionDto: UpdateGradeCompositionDto) {
    return updateGradeCompositionDto;
  }

  remove(id: number) {
    return `This action removes a #${id} gradeComposition`;
  }
}
