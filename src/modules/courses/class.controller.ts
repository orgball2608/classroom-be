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
import { IUserRequest } from '@src/interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { Course } from './entities/course.entity';
import { ApiResponseWithMessage } from '@src/decorators';
import { COURSES_MESSAGES } from '@src/constants';
import { InviteEmailDto } from './dto/invite-email.dto';

@ApiTags('Course')
@ApiBearerAuth()
@Controller('courses')
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
  enroll(@Req() req: IUserRequest, @Param('id', ParseIntPipe) id: number) {
    if (req.isEnrolled === true) {
      return {
        message: COURSES_MESSAGES.USER_ENROLLED_COURSE,
      };
    }
    return this.courseService.enrollToCourse(req.user.id, id);
  }

  // send email for
  @Post('/invite/email')
  @ApiBody({ type: InviteEmailDto })
  // @ApiResponseWithMessage(Course)
  inviteByEmail(@Req() req: IUserRequest, @Body() body: InviteEmailDto) {
    const fullName = req.user.firstName + ' ' + req.user.lastName;
    return this.courseService.inviteByEmail(
      body.email,
      body.courseId,
      body.role,
      fullName,
    );
  }

  //verify email
  @Post('/join/:token')
  joinCourse(@Req() req: IUserRequest, @Param() token: { token: string }) {
    console.log(token);
    const t = token.token as string;
    return this.courseService.verifyInvitationEmailToken(req.user.id, t);
  }
}
