import { Controller, Get, Header, Res } from '@nestjs/common';

import { Response } from 'express';
import { ExcelService } from './excel.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Excels')
@ApiBearerAuth()
@Controller('excels')
export class ExcelController {
  constructor(private excelService: ExcelService) {}

  @Get('/download')
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async downloadReport(@Res() res: Response) {
    const result = await this.excelService.downloadExcel();
    res.download(`${result}`);
  }
}
