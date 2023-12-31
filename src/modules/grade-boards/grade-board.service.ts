import { GRADE_BOARS_MESSAGES } from '@src/constants';
import { IGradeBoarRowData } from './grade-boar.interface';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/shared/prisma/prisma.service';

@Injectable()
export class GradeBoardService {
  constructor(private readonly prisma: PrismaService) {}

  async getGradeBoardTemplate(courseId: number) {
    const gradeCompositions = await this.prisma.gradeComposition.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: {
        index: 'asc',
      },
    });

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: {
        studentId: 'asc',
      },
    });

    const headers = [
      {
        key: 'index',
        label: 'STT',
        metaData: null,
      },
      {
        key: 'studentId',
        label: 'MSSV',
        metaData: null,
      },
      {
        key: 'fullName',
        label: 'Họ và tên',
        metaData: null,
      },
    ];

    for (const gradeComposition of gradeCompositions) {
      const header = {
        key: `gradeComposition-${gradeComposition.id}`,
        label: gradeComposition.name,
        metaData: gradeComposition,
      };

      headers.push(header);
    }

    let index = 1;

    const gradeBoardTemplate = await Promise.all(
      enrollments.map(async (enrollment) => {
        const rowData: IGradeBoarRowData = {
          index: index++,
          studentId: enrollment.studentId,
          fullName: enrollment.fullName,
        };

        for (const gradeComposition of gradeCompositions) {
          const columnKey = `gradeComposition-${gradeComposition.id}`;

          rowData[columnKey] = 0;
        }

        return rowData;
      }),
    );

    return {
      message:
        GRADE_BOARS_MESSAGES.GET_GRADE_BOARD_TEMPLATE_FOR_COURSE_SUCCESSFULLY,
      data: {
        headers: headers,
        rows: gradeBoardTemplate,
      },
    };
  }

  async getFinalGradeBoard(courseId: number) {
    const gradeCompositions = await this.prisma.gradeComposition.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: {
        index: 'asc',
      },
    });

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: {
        studentId: 'asc',
      },
    });

    const headers = [
      {
        key: 'index',
        label: 'STT',
        metaData: null,
      },
      {
        key: 'studentId',
        label: 'MSSV',
        metaData: null,
      },
      {
        key: 'fullName',
        label: 'Họ và tên',
        metaData: null,
      },
    ];

    for (const gradeComposition of gradeCompositions) {
      const header = {
        key: `gradeComposition-${gradeComposition.id}`,
        label: gradeComposition.name,
        metaData: gradeComposition,
      };

      headers.push(header);
    }

    let index = 1;

    const finalGradeBoard = await Promise.all(
      enrollments.map(async (enrollment) => {
        const grades = await this.prisma.grade.findMany({
          where: {
            studentId: enrollment.studentId,
            gradeCompositionId: {
              in: gradeCompositions.map((gc) => gc.id),
            },
          },
        });

        const rowData: IGradeBoarRowData = {
          index: index++,
          studentId: enrollment.studentId,
          fullName: enrollment.fullName,
        };

        let totalGrade = 0;
        let totalScale = 0;

        for (const gradeComposition of gradeCompositions) {
          const grade = grades.find(
            (grade) => grade.gradeCompositionId === gradeComposition.id,
          );

          const columnKey = `gradeComposition-${gradeComposition.id}`;

          if (grade) {
            rowData[columnKey] = grade.grade || 0;
            totalGrade += grade.grade * gradeComposition.scale || 0;
            totalScale += gradeComposition.scale;
          }
        }

        rowData['totalGrade'] = Number((totalGrade / totalScale).toFixed(2));

        return rowData;
      }),
    );

    return {
      message: GRADE_BOARS_MESSAGES.GET_FINAL_GRADE_BOARD_SUCCESSFULLY,
      data: {
        headers: headers,
        rows: finalGradeBoard,
      },
    };
  }
}
