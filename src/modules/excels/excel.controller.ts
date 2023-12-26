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
  async downloadReport(@Req() req: ICourseRequest, @Res() res: Response) {
    const result = await this.excelService.downloadExcel(req.course);
    res.download(`${result}`);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.excelService.readFileExcel(file);
  }
}
