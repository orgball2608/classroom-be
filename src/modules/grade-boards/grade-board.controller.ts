import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';

import { Controller, Get, Req } from '@nestjs/common';
import { GradeBoardService } from './grade-board.service';
import { ROUTES } from '@src/constants';
import { ICourseRequest } from '@src/interfaces';

@ApiTags('Grade boards')
@ApiBearerAuth()
@Controller(ROUTES.GRADE_BOARDS)
export class GradeBoardController {
  constructor(private readonly gradeBoardService: GradeBoardService) {}

  @Get('/template')
  @ApiParam({ name: 'courseId', type: Number, example: 1 })
  getGradeBoardTemplate(@Req() req: ICourseRequest) {
    return this.gradeBoardService.getGradeBoardTemplate(req.course.id);
  }

  @Get('/final')
  @ApiParam({ name: 'courseId', type: Number, example: 1 })
  getFinalGradeBoard(@Req() req: ICourseRequest) {
    return this.gradeBoardService.getFinalGradeBoard(req.course.id);
  }
}
