import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { GradeService } from './grade.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiCreate, ApiFindAll } from '@src/decorators';
import { Grade } from './entities/grade.entity';
import { IUserRequest } from '@src/interfaces';
import { ROUTES } from '@src/constants';

@ApiTags('Grades')
@ApiBearerAuth()
@Controller(ROUTES.GRADES)
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  @ApiCreate(CreateGradeDto, Grade)
  create(
    @Param('compositionId', ParseIntPipe) compositionId: number,
    @Req() req: IUserRequest,
    @Body() createGradeDto: CreateGradeDto,
  ) {
    return this.gradeService.create(req.user.id, compositionId, createGradeDto);
  }

  @Get()
  @ApiFindAll(Grade)
  findAll() {
    return this.gradeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gradeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGradeDto: UpdateGradeDto,
  ) {
    return this.gradeService.update(id, updateGradeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gradeService.remove(id);
  }
}
