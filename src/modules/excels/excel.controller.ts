import {
  Controller,
  Get,
  Header,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { Response } from 'express';
import { ExcelService } from './excel.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ROUTES } from '@src/constants';
import { ICourseRequest, IGradeCompositionRequest } from '@src/interfaces';

@ApiTags('Excels')
@ApiBearerAuth()
@Controller(ROUTES.EXCELS)
export class ExcelController {
  constructor(private excelService: ExcelService) {}

  @Get('/students-template/download')
  @Header('Content-type', 'text/xlsx')
  async downloadStudentListTemplate(@Res() res: Response) {
    const result = await this.excelService.downloadStudentListTemplate();
    res.download(`${result}`);
  }

  @Get('courses/:courseId/grades-template/download')
  @Header('Content-type', 'text/xlsx')
  @ApiParam({ name: 'courseId', type: 'number', example: 1 })
  async downloadGradesTemplate(
    @Req() req: ICourseRequest,
    @Res() res: Response,
  ) {
    const result = await this.excelService.downloadGradesTemplate(req.course);
    res.download(`${result}`);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'courseId', type: 'number', example: 1 })
  @Post('courses/:courseId/students/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadStudentList(
    @Req() req: ICourseRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.excelService.readStudentList(req.course, file);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'courseId', type: 'number', example: 1 })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @Post('courses/:courseId/grade-compositions/:id/grades/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadGrades(
    @Req() req: IGradeCompositionRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.excelService.readGrades(req.gradeComposition, file);
  }

  @Get('courses/:courseId/grade-board/download')
  @Header('Content-type', 'text/xlsx')
  @ApiParam({ name: 'courseId', type: 'number', example: 1 })
  async downloadGradeBoard(@Req() req: ICourseRequest, @Res() res: Response) {
    const result = await this.excelService.downloadGradeBoard(
      req.user.id,
      req.course,
    );
    res.download(`${result}`);
  }
}
