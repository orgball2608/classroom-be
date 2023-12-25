import { ExcelController } from './excel.controller';
import { ExcelService } from './excel.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [ExcelController],
  providers: [ExcelService],
})
export class ExcelModule {}
