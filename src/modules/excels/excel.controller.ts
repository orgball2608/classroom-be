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
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ROUTES } from '@src/constants';
import { ICourseRequest } from '@src/interfaces';

@ApiTags('Excels')
@ApiBearerAuth()
@Controller(ROUTES.EXCELS)
export class ExcelController {
  constructor(private excelService: ExcelService) {}

  @Get('/students-template/download')
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async downloadStudentListTemplate(@Res() res: Response) {
    const result = await this.excelService.downloadStudentListTemplate();
    res.download(`${result}`);
  }

  @Get('courses/:courseId/grades-template/download')
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiParam({ name: 'courseId', type: 'number', example: 1 })
  async downloadGradesTemplate(
    @Req() req: ICourseRequest,
    @Res() res: Response,
  ) {
    const result = await this.excelService.downloadGradesTemplate(req.course);
    res.download(`${result}`);
  }

  @Post('courses/:courseId/students/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadStudentList(
    @Req() req: ICourseRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.excelService.readStudentList(req.course, file);
  }
}
