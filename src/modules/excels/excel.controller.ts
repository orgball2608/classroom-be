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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ROUTES } from '@src/constants';
import { ICourseRequest } from '@src/interfaces';

@ApiTags('Excels')
@ApiBearerAuth()
@Controller(ROUTES.EXCELS)
export class ExcelController {
  constructor(private excelService: ExcelService) {}

  @Get('/enrollments/download')
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async downloadStudentListTemplate(@Res() res: Response) {
    const result = await this.excelService.downloadStudentListTemplate();
    res.download(`${result}`);
  }

  @Post('/enrollments/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadStudentList(
    @Req() req: ICourseRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.excelService.readStudentList(req.course, file);
  }
}
