import * as tmp from 'tmp';

import { Workbook, Worksheet } from 'exceljs';

import { Course } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/shared/prisma/prisma.service';

@Injectable()
export class ExcelService {
  constructor(private readonly prisma: PrismaService) {}

  private styleSheet(sheet: Worksheet) {
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

  async downloadExcel(course: Course) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId: course.id,
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
      { header: 'StudentId', key: 'StudentId', width: 20 },
      { header: 'Full name', key: 'Full name', width: 20 },
    ];

    data.forEach((item) => {
      sheet.addRow(item);
    });

    this.styleSheet(sheet);

    const tmpFile = tmp.fileSync({
      discardDescriptor: true,
      prefix: `${course.name}_`,
      postfix: '.xlsx',
      mode: parseInt('0600', 8),
    });
    await workbook.xlsx.writeFile(tmpFile.name);

    return tmpFile.name;
  }

  async readFileExcel(file: Express.Multer.File) {
    const workbook = new Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheet = workbook.getWorksheet('sheet1');
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
    });

    return {
      message: 'Read excel successfully',
    };
  }
}
