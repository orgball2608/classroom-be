import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type ValidationError } from 'class-validator';
import { type Response } from 'express';

@Catch(UnprocessableEntityException)
export class HttpExceptionFilter
  implements ExceptionFilter<UnprocessableEntityException>
{
  constructor(public reflector: Reflector) {}

  catch(exception: UnprocessableEntityException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const r = exception.getResponse() as { message: ValidationError[] };

    const validationErrors = r.message;

    response.status(statusCode).json({
      message: validationErrors.map((err) => ({
        fieldName: err.property,
        errorMessage: `${
          Object.values(err.constraints)[0].charAt(0).toUpperCase() +
          Object.values(err.constraints)[0].slice(1)
        }`,
      })),
      error: 'Unprocessable Entity',
      statusCode: statusCode,
    });
  }
}
