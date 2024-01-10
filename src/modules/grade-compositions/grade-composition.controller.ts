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
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  ApiCreate,
  ApiFindOne,
  ApiFindAll,
  ApiUpdate,
  ApiDelete,
} from '@src/decorators';
import { GradeCompositionEntity } from './entities/grade-composition.entity';
import { IGradeCompositionRequest, IUserRequest } from '@src/interfaces';
import { ROUTES } from '@src/constants';

@ApiTags('Grade compositions')
@ApiBearerAuth()
@Controller(ROUTES.GRADE_COMPOSITIONS)
export class GradeCompositionController {
  constructor(
    private readonly gradeCompositionService: GradeCompositionService,
  ) {}

  @Post()
  @ApiParam({ name: 'courseId', type: 'number', example: 1 })
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
  @ApiParam({ name: 'courseId', type: 'number', example: 1 })
  @ApiFindAll(GradeCompositionEntity)
  findAllByCourseId(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.gradeCompositionService.findAllByCourseId(courseId);
  }

  @Get(':id')
  @ApiParam({ name: 'courseId', type: 'number', example: 1 })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiFindOne(GradeCompositionEntity)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gradeCompositionService.findOne(id);
  }

  @Patch(':id/finalize')
  @ApiParam({ name: 'courseId', type: 'number', example: 1 })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  markFinalize(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IGradeCompositionRequest,
    @Body() body: UpdateGradeCompositionDto,
  ) {
    return this.gradeCompositionService.markFinalize(
      id,
      req.course,
      body.isFinalized,
    );
  }

  @Patch(':id')
  @ApiParam({ name: 'courseId', type: 'number', example: 1 })
  @ApiUpdate(UpdateGradeCompositionDto, GradeCompositionEntity)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGradeCompositionDto: UpdateGradeCompositionDto,
  ) {
    return this.gradeCompositionService.update(id, updateGradeCompositionDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'courseId', type: 'number', example: 1 })
  @ApiDelete()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gradeCompositionService.remove(id);
  }

  @Post(':firstId/switch-index/:secondId')
  @ApiParam({ name: 'courseId', type: 'number', example: 1 })
  @ApiParam({ name: 'firstId', type: Number, example: 1 })
  @ApiParam({ name: 'secondId', type: Number, example: 2 })
  switchGradeCompositionIndex(
    @Param('firstId', ParseIntPipe) firstId: number,
    @Param('secondId', ParseIntPipe) secondId: number,
  ) {
    return this.gradeCompositionService.switchGradeCompositionIndex(
      firstId,
      secondId,
    );
  }
}
