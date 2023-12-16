import { CreateGradeDto } from './dto/create-grade.dto';
import { Injectable } from '@nestjs/common';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Injectable()
export class GradeService {
  create(createGradeDto: CreateGradeDto) {
    return createGradeDto;
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
