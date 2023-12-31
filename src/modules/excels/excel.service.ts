import * as tmp from 'tmp';

import { Column, Workbook, Worksheet } from 'exceljs';
import { Course, GradeComposition } from '@prisma/client';

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

    const sheet = workbook.addWorksheet('student-list');

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

  async downloadGradesTemplate(course: Course) {
    const workbook = new Workbook();

    const sheet = workbook.addWorksheet('grades');

    sheet.columns = [
      {
        header: 'STT',
        key: 'stt',
        width: 10,
        style: {
          alignment: {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
          },
        },
      },
      {
        header: 'StudentId',
        key: 'studentId',
        width: 20,
        style: {
          alignment: {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
          },
        },
      },
      {
        header: 'Grade',
        key: 'grade',
        width: 20,
        style: {
          alignment: {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
          },
        },
      },
    ];

    const students = await this.prisma.enrollment.findMany({
      where: {
        courseId: course.id,
      },
      select: {
        studentId: true,
        fullName: true,
      },
    });

    let stt = 1;

    students.forEach((student) => {
      sheet.addRow({
        stt: stt++,
        studentId: student.studentId,
        fullName: student.fullName,
      });
    });

    this.styleSheet(sheet);

    const tmpFile = tmp.fileSync({
      discardDescriptor: true,
      prefix: `grades-template-course-${course.id}`,
      postfix: '.xlsx',
      mode: parseInt('0600', 8),
    });

    await workbook.xlsx.writeFile(tmpFile.name);

    return tmpFile.name;
  }

  async readStudentList(course: Course, file: Express.Multer.File) {
    const workbook = new Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheet = workbook.getWorksheet('student-list');

    const gradeCompositions = await this.prisma.gradeComposition.findMany({
      where: {
        courseId: course.id,
      },
      orderBy: {
        index: 'asc',
      },
    });

    const promises: Promise<any>[] = [];

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      // Skip header
      if (rowNumber === 1) return;
      const studentId: string = String(row.values[1]);
      const fullName: string = String(row.values[2]);

      const promise = this.prisma.$transaction(
        async (tx) => {
          await tx.enrollment.upsert({
            where: {
              studentId_courseId: {
                studentId: studentId,
                courseId: course.id,
              },
            },
            update: {
              fullName: fullName,
            },
            create: {
              studentId: studentId,
              fullName: fullName,
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

          await Promise.all(
            gradeCompositions.map(async (gradeComposition) => {
              await tx.grade.upsert({
                where: {
                  studentId_gradeCompositionId: {
                    studentId: studentId,
                    gradeCompositionId: gradeComposition.id,
                  },
                },
                update: {},
                create: {
                  studentId: studentId,
                  gradeComposition: {
                    connect: {
                      id: gradeComposition.id,
                    },
                  },
                  createdBy: {
                    connect: {
                      id: course.createdById,
                    },
                  },
                },
              });
            }),
          );
        },
        {
          maxWait: 5000, // default: 2000
          timeout: 10000, // default: 5000
        },
      );

      promises.push(promise);
    });

    await Promise.all(promises);

    return {
      message: EXCEL_MESSAGES.UPLOAD_STUDENT_LIST_SUCCESSFULLY,
    };
  }

  async readGrades(
    gradeComposition: GradeComposition,
    file: Express.Multer.File,
  ) {
    const workbook = new Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheet = workbook.getWorksheet('grades');

    const promises: Promise<any>[] = [];

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      // Skip header
      if (rowNumber === 1) return;
      const studentId: string = String(row.values[2]);
      const grade: number = Number(row.values[3]);

      const promise = this.prisma.grade.upsert({
        where: {
          studentId_gradeCompositionId: {
            studentId: studentId,
            gradeCompositionId: gradeComposition.id,
          },
        },
        update: {
          grade: grade,
        },
        create: {
          studentId: studentId,
          gradeComposition: {
            connect: {
              id: gradeComposition.id,
            },
          },
          createdBy: {
            connect: {
              id: gradeComposition.createdById,
            },
          },
          grade: grade,
        },
      });

      promises.push(promise);
    });

    await Promise.all(promises);

    return {
      message: EXCEL_MESSAGES.UPLOAD_GRADES_SUCCESSFULLY,
    };
  }

  async downloadGradeBoard(course: Course) {
    const workbook = new Workbook();

    const sheet = workbook.addWorksheet('grade-board');

    const gradeCompositions = await this.prisma.gradeComposition.findMany({
      where: {
        courseId: course.id,
      },
      orderBy: {
        index: 'asc',
      },
    });

    const sheetColumns: Partial<Column>[] = [
      {
        header: 'STT',
        key: 'stt',
        width: 10,
        style: {
          alignment: {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
          },
        },
      },
      {
        header: 'StudentId',
        key: 'studentId',
        width: 20,
        style: {
          alignment: {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
          },
        },
      },
    ];

    gradeCompositions.forEach((gradeComposition) => {
      const columnKey = `grade-composition-${gradeComposition.id}`;
      sheetColumns.push({
        header: gradeComposition.name,
        key: columnKey,
        width: 20,
        style: {
          alignment: {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
          },
        },
      });
    });

    sheet.columns = sheetColumns;

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId: course.id,
      },
    });

    let stt = 1;

    await Promise.all(
      enrollments.map(async (enrollment) => {
        const grades = await this.prisma.grade.findMany({
          where: {
            studentId: enrollment.studentId,
            gradeCompositionId: {
              in: gradeCompositions.map((gc) => gc.id),
            },
          },
        });

        const rowData = {
          stt: stt++,
          studentId: enrollment.studentId,
          fullName: enrollment.fullName,
        };

        for (const gradeComposition of gradeCompositions) {
          const grade = grades.find(
            (grade) => grade.gradeCompositionId === gradeComposition.id,
          );

          const columnKey = `grade-composition-${gradeComposition.id}`;

          if (grade) {
            rowData[columnKey] = grade.grade || 0;
          } else {
            rowData[columnKey] = 'N/A';
          }
        }

        sheet.addRow(rowData);
      }),
    );

    this.styleSheet(sheet);

    const tmpFile = tmp.fileSync({
      discardDescriptor: true,
      prefix: `grade-board-course-${course.id}`,
      postfix: '.xlsx',
      mode: parseInt('0600', 8),
    });

    await workbook.xlsx.writeFile(tmpFile.name);

    return tmpFile.name;
  }
}
