import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { GradeCompositionService } from './grade-composition.service';
import { CreateGradeCompositionDto } from './dto/create-grade-composition.dto';
import { UpdateGradeCompositionDto } from './dto/update-grade-composition.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Grade Composition')
@ApiBearerAuth()
@Controller('grade-struct')
export class GradeCompositionController {
  constructor(
    private readonly gradeCompositionService: GradeCompositionService,
  ) {}

  @Post()
  create(@Body() createGradeCompositionDto: CreateGradeCompositionDto) {
    return this.gradeCompositionService.create(createGradeCompositionDto);
  }

  @Get()
  findAll() {
    return this.gradeCompositionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gradeCompositionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGradeCompositionDto: UpdateGradeCompositionDto,
  ) {
    return this.gradeCompositionService.update(id, updateGradeCompositionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gradeCompositionService.remove(id);
  }
}
