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
import { GradeCompositionService } from './grade-composition.service';
import { CreateGradeCompositionDto } from './dto/create-grade-composition.dto';
import { UpdateGradeCompositionDto } from './dto/update-grade-composition.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiCreate,
  ApiDelete,
  ApiFindAll,
  ApiFindOne,
  ApiUpdate,
} from '@src/decorators';
import { GradeCompositionEntity } from './entities/grade-composition.entity';
import { IUserRequest } from '@src/interfaces';

@ApiTags('Grade Composition')
@ApiBearerAuth()
@Controller('courses/:courseId/grade-compositions')
export class GradeCompositionController {
  constructor(
    private readonly gradeCompositionService: GradeCompositionService,
  ) {}

  @Post()
  @ApiCreate(CreateGradeCompositionDto, GradeCompositionEntity)
  create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: IUserRequest,
    @Body() createGradeCompositionDto: CreateGradeCompositionDto,
  ) {
    return this.gradeCompositionService.create(
      req.user,
      courseId,
      createGradeCompositionDto,
    );
  }

  @Get()
  @ApiFindAll(GradeCompositionEntity)
  findAllByCourseId(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.gradeCompositionService.findAllByCourseId(courseId);
  }

  @Get(':id')
  @ApiFindOne(GradeCompositionEntity)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gradeCompositionService.findOne(id);
  }

  @Patch(':id')
  @ApiUpdate(UpdateGradeCompositionDto, GradeCompositionEntity)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGradeCompositionDto: UpdateGradeCompositionDto,
  ) {
    return this.gradeCompositionService.update(id, updateGradeCompositionDto);
  }

  @Delete(':id')
  @ApiDelete()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gradeCompositionService.remove(id);
  }
}
