import { Controller, Get, Post, Body, Patch, Param, Req } from '@nestjs/common';
import { GradeReviewService } from './grade-review.service';
import { CreateGradeReviewDto } from './dto/create-grade-review.dto';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { ROUTES } from '@src/constants';
import { ICourseRequest, IGradeRequest } from '@src/interfaces';
import { ApiCreate } from '@src/decorators';
import { GradeReview } from './entities/grade-review.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Grade reviews')
@ApiBearerAuth()
@Controller(ROUTES.GRADE_REVIEWS)
export class GradeReviewController {
  constructor(private readonly gradeReviewService: GradeReviewService) {}

  @Post('/grade-compositions/:compositionId/grades/:gradeId')
  @ApiParam({ name: 'courseId', type: Number, example: 1 })
  @ApiParam({ name: 'compositionId', type: Number, example: 1 })
  @ApiParam({ name: 'gradeId', type: Number, example: 1 })
  @ApiCreate(CreateGradeReviewDto, GradeReview)
  create(
    @Req() req: IGradeRequest,
    @Body() createGradeReviewDto: CreateGradeReviewDto,
  ) {
    return this.gradeReviewService.create(
      req.user,
      req.grade.id,
      createGradeReviewDto,
    );
  }

  @Get('/list')
  @ApiParam({ name: 'courseId', type: Number, example: 1 })
  findAll(@Req() req: ICourseRequest) {
    return this.gradeReviewService.getListReview(req.course.id);
  }

  @Patch('/:reviewId/mark-completed')
  @ApiParam({ name: 'reviewId', type: Number, example: 1 })
  markCompleted(
    @Req() req: ICourseRequest,
    @Param('reviewId') reviewId: number,
  ) {
    return this.gradeReviewService.markCompleted(req.user, reviewId);
  }

  @Patch('/:reviewId/mark-incomplete')
  @ApiParam({ name: 'reviewId', type: Number, example: 1 })
  markInComplete(
    @Req() req: ICourseRequest,
    @Param('reviewId') reviewId: number,
  ) {
    return this.gradeReviewService.markInComplete(req.user, reviewId);
  }

  @Post('/:reviewId/comment')
  @ApiParam({ name: 'reviewId', type: Number, example: 1 })
  createComment(
    @Param('reviewId') reviewId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: ICourseRequest,
  ) {
    return this.gradeReviewService.createComment(
      reviewId,
      createCommentDto,
      req.user,
      req.course,
    );
  }

  @Get('/:reviewId/comment/list')
  @ApiParam({ name: 'reviewId', type: Number, example: 1 })
  getCommentList(@Param('reviewId') reviewId: number) {
    return this.gradeReviewService.getCommentList(reviewId);
  }
}
