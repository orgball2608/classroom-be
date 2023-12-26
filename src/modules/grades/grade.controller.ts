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
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiCreate, ApiFindAll } from '@src/decorators';
import { Grade } from './entities/grade.entity';
import { IGradeCompositionRequest } from '@src/interfaces';
import { ROUTES } from '@src/constants';

@ApiTags('Grades')
@ApiBearerAuth()
@Controller(ROUTES.GRADES)
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  @ApiCreate(CreateGradeDto, Grade)
  @ApiParam({ name: 'courseId', type: Number, example: 1 })
  @ApiParam({ name: 'compositionId', type: Number, example: 1 })
  create(
    @Req() req: IGradeCompositionRequest,
    @Body() createGradeDto: CreateGradeDto,
  ) {
    return this.gradeService.create(
      req.user.id,
      req.gradeComposition.id,
      createGradeDto,
    );
  }

  @Get()
  @ApiFindAll(Grade)
  @ApiParam({ name: 'courseId', type: Number, example: 1 })
  @ApiParam({ name: 'compositionId', type: Number, example: 1 })
  findAll(@Req() req: IGradeCompositionRequest) {
    return this.gradeService.findAll(req.gradeComposition.id);
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
