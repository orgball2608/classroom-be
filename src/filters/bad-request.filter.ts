import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type ValidationError } from 'class-validator';
import { type Response } from 'express';
import _ from 'lodash';

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
          err.property.charAt(0).toUpperCase() + err.property.slice(1)
        } is invalid`,
      })),
      error: 'Unprocessable Entity',
      statusCode: statusCode,
    });
  }
}
