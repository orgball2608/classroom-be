import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  Patch,
} from '@nestjs/common';
import { GradeService } from './grade.service';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiFindAll, ApiUpdate } from '@src/decorators';
import { Grade } from './entities/grade.entity';
import { IGradeCompositionRequest } from '@src/interfaces';
import { ROUTES } from '@src/constants';
import { UpdateGradeDto } from './dto/update-grade.dto';

@ApiTags('Grades')
@ApiBearerAuth()
@Controller(ROUTES.GRADES)
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Patch('/:gradeId')
  @ApiUpdate(UpdateGradeDto, Grade)
  @ApiParam({ name: 'courseId', type: Number, example: 1 })
  @ApiParam({ name: 'compositionId', type: Number, example: 1 })
  updateGrade(
    @Req() req: IGradeCompositionRequest,
    @Body() updateGradeDto: UpdateGradeDto,
  ) {
    return this.gradeService.updateGrade(
      req.gradeComposition.id,
      updateGradeDto,
    );
  }

  @Get()
  @ApiFindAll(Grade)
  @ApiParam({ name: 'courseId', type: Number, example: 1 })
  @ApiParam({ name: 'compositionId', type: Number, example: 1 })
  findAll(@Req() req: IGradeCompositionRequest) {
    return this.gradeService.findAll(req.gradeComposition.id);
  }

  @Delete(':id')
  @ApiParam({ name: 'courseId', type: Number, example: 1 })
  @ApiParam({ name: 'compositionId', type: Number, example: 1 })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gradeService.remove(id);
  }
}
