import * as tmp from 'tmp';

import { Workbook, Worksheet } from 'exceljs';

import { Course } from '@prisma/client';
import { EXCEL_MESSAGES } from '@src/constants';
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

  async downloadStudentListTemplate() {
    const workbook = new Workbook();

    const sheet = workbook.addWorksheet('list-student');

    sheet.columns = [
      {
        header: 'StudentId',
        key: 'studentId',
        width: 20,
        style: {
          alignment: {
            vertical: 'middle',
            wrapText: true,
          },
        },
      },
      {
        header: 'Full name',
        key: 'fullName',
        width: 40,
        style: {
          alignment: {
            vertical: 'middle',
            wrapText: true,
          },
        },
      },
    ];

    this.styleSheet(sheet);

    const tmpFile = tmp.fileSync({
      discardDescriptor: true,
      prefix: 'student-list-template',
      postfix: '.xlsx',
      mode: parseInt('0600', 8),
    });

    await workbook.xlsx.writeFile(tmpFile.name);

    return tmpFile.name;
  }

  async readStudentList(course: Course, file: Express.Multer.File) {
    const workbook = new Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheet = workbook.getWorksheet('sheet1');

    worksheet.eachRow({ includeEmpty: true }, async (row, rowNumber) => {
      // Skip header
      if (rowNumber === 1) return;
      await this.prisma.enrollment.upsert({
        where: {
          studentId_courseId: {
            studentId: String(row.values[1]),
            courseId: course.id,
          },
        },
        update: {
          fullName: String(row.values[2]),
        },
        create: {
          studentId: String(row.values[1]),
          fullName: String(row.values[2]),
          course: {
            connect: {
              id: course.id,
            },
          },
          createdBy: {
            connect: {
              id: course.createdById,
            },
          },
        },
      });
    });

    return {
      message: EXCEL_MESSAGES.UPLOAD_STUDENT_LIST_SUCCESSFULLY,
    };
  }
}
