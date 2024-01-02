import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { GradeReviewService } from './grade-review.service';
import { CreateGradeReviewDto } from './dto/create-grade-review.dto';
import { UpdateGradeReviewDto } from './dto/update-grade-review.dto';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ROUTES } from '@src/constants';
import { IGradeRequest } from '@src/interfaces';

@ApiTags('Grade reviews')
@ApiBearerAuth()
@Controller(ROUTES.GRADE_REVIEWS)
export class GradeReviewController {
  constructor(private readonly gradeReviewService: GradeReviewService) {}

  @Post()
  @ApiParam({ name: 'courseId', type: Number, example: 1 })
  @ApiParam({ name: 'compositionId', type: Number, example: 1 })
  @ApiParam({ name: 'gradeId', type: Number, example: 1 })
  @ApiBody({ type: CreateGradeReviewDto })
  create(
    @Req() req: IGradeRequest,
    @Body() createGradeReviewDto: CreateGradeReviewDto,
  ) {
    return this.gradeReviewService.create(
      req.user.id,
      req.grade.id,
      createGradeReviewDto,
    );
  }

  @Get()
  findAll() {
    return this.gradeReviewService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'courseId', type: Number, example: 1 })
  @ApiParam({ name: 'compositionId', type: Number, example: 1 })
  @ApiParam({ name: 'gradeId', type: Number, example: 1 })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gradeReviewService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'courseId', type: Number, example: 1 })
  @ApiParam({ name: 'compositionId', type: Number, example: 1 })
  @ApiParam({ name: 'gradeId', type: Number, example: 1 })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateGradeReviewDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGradeReviewDto: UpdateGradeReviewDto,
  ) {
    return this.gradeReviewService.update(id, updateGradeReviewDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'courseId', type: Number, example: 1 })
  @ApiParam({ name: 'compositionId', type: Number, example: 1 })
  @ApiParam({ name: 'gradeId', type: Number, example: 1 })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gradeReviewService.remove(id);
  }
}
