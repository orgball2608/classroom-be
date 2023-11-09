import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error(exception.message);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        const errorMessage = 'Xuất hiện xung đột dữ liệu';
        response.status(status).json({
          statusCode: status,
          message: errorMessage,
        });
        break;
      }
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        const errorMessage = 'Dữ liệu không tồn tại';
        response.status(status).json({
          statusCode: status,
          message: errorMessage,
        });
        break;
      }
      default:
        // default 500 error code
        super.catch(exception, host);
        break;
    }
  }
}
