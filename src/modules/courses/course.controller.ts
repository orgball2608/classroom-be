import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  Req,
  UploadedFile,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ICourseRequest, IUserRequest } from '@src/interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { Course } from './entities/course.entity';
import { ApiResponseWithMessage } from '@src/decorators';
import { COURSES_MESSAGES, ROUTES } from '@src/constants';
import { InviteEmailDto } from './dto/invite-email.dto';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller(ROUTES.COURSES)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiBody({ type: CreateCourseDto })
  @ApiResponseWithMessage(Course)
  create(@Req() req: IUserRequest, @Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(req.user.id, createCourseDto);
  }

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findOne(id);
  }

  @Get('teacher/:id')
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  findAllCourseByTeacherId(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findAllCourseByTeacherId(id);
  }

  @Get('student/:id')
  @ApiResponseWithMessage(Course)
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  findAllCourseByStudentId(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findAllCourseByStudentId(id);
  }

  @Patch(':id/avatar')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
      },
    },
  })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponseWithMessage(Course)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  updateCourseImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    return this.courseService.updateCourseImage(id, avatar);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponseWithMessage(Course)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.remove(id);
  }

  // get list of student and teacher in class
  @Get(':id/users')
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  findAllUserInCourse(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findAllUserInCourse(id);
  }

  @Get('/my-courses/list')
  findAllCourseOfMe(@Req() req: IUserRequest) {
    return this.courseService.findAllCourseOfMe(req.user.id);
  }

  @Get('/checkEnrolled/:id')
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  async checkEnrolled(@Req() req: IUserRequest) {
    const course = await this.courseService.findOne(Number(req.params.id));
    const result = {
      message: COURSES_MESSAGES.USER_NOT_IN_COURSE,
      data: {
        isEnrolled: false,
        course,
      },
    };

    if (req.isEnrolled === true) {
      result.message = COURSES_MESSAGES.USER_ENROLLED_COURSE;
      result.data.isEnrolled = true;
    }
    return result;
  }

  @Patch(':id/enroll')
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  enrollCourse(
    @Req() req: ICourseRequest,
    @Param('id', ParseIntPipe) courseId: number,
  ) {
    if (req.isEnrolled === true) {
      return {
        message: COURSES_MESSAGES.USER_ENROLLED_COURSE,
      };
    }
    return this.courseService.enrollToCourse(req.user, req.course, courseId);
  }

  @Delete(':id/enrollments/me/leave')
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  leaveCourse(
    @Req() req: ICourseRequest,
    @Param('id', ParseIntPipe) courseId: number,
  ) {
    return this.courseService.leaveCourse(req.user.id, req.course, courseId);
  }

  @Post('/invite/email')
  @ApiBody({ type: InviteEmailDto })
  inviteByEmail(@Req() req: IUserRequest, @Body() body: InviteEmailDto) {
    const fullName = req.user.firstName + ' ' + req.user.lastName;
    return this.courseService.inviteByEmail(
      body.email,
      body.courseId,
      body.role,
      fullName,
    );
  }

  @Post('/join/:token')
  joinCourse(@Req() req: IUserRequest, @Param() token: { token: string }) {
    const t = token.token as string;
    return this.courseService.verifyInvitationEmailToken(req.user.id, t);
  }

  @Delete(':courseId/users/:userId')
  @ApiParam({ name: 'courseId', type: 'number', example: 1 })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  removeUserInCourse(
    @Req() req: ICourseRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.courseService.removeUserInCourse(userId, req.course, courseId);
  }
}
