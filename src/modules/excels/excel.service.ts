import * as tmp from 'tmp';

import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '@src/shared/prisma/prisma.service';
import { Workbook } from 'exceljs';

@Injectable()
export class ExcelService {
  constructor(private readonly prisma: PrismaService) {}

  private styleSheet(sheet) {
    sheet.getRow(1).height = 30.5;
    sheet.getRow(1).font = {
      size: 11.5,
      bold: true,
      color: { argb: 'FFFFFF' },
    };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '000000' },
      bgColor: { argb: '000000' },
    };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: 'FFFFFF' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: 'FFFFFF' } },
    };
  }

  async downloadExcel() {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId: 1,
      },
      select: {
        studentId: true,
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const data = enrollments.map((item) => {
      return {
        studentId: Number(item.studentId),
        fullName: `${item.student.firstName} ${item.student.lastName}`,
      };
    });

    const workbook = new Workbook();

    const sheet = workbook.addWorksheet('sheet1');

    sheet.columns = [
      { header: 'StudentId', key: 'studentId', width: 20 },
      { header: 'FullName', key: 'fullName', width: 20 },
    ];

    data.forEach((item) => {
      sheet.addRow(item);
    });

    this.styleSheet(sheet);

    const tmpFile = tmp.fileSync();
    await workbook.xlsx.writeFile(tmpFile.name);

    const File = tmpFile.name;

    return File;
  }
}
