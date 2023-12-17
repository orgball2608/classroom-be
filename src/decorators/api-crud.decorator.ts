import {
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ApiResponseArrayEntity,
  ApiResponseEntity,
} from '@src/common/entity/response.entity';
import { HttpCode, HttpStatus, Type, applyDecorators } from '@nestjs/common';

export const ApiCreate = <DataDto extends Type<unknown>>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  bodyDto: Function,
  dataDto: DataDto,
) => {
  return applyDecorators(
    ApiBody({ type: bodyDto }),
    ApiCreatedResponse({
      description: `Create successfully`,
      schema: {
        type: 'object',
        allOf: [
          { $ref: getSchemaPath(ApiResponseEntity) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(dataDto),
              },
            },
          },
        ],
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Internal server error' },
        },
      },
    }),
    HttpCode(HttpStatus.CREATED),
  );
};

export const ApiFindOne = <DataDto extends Type<unknown>>(dataDto: DataDto) => {
  return applyDecorators(
    ApiParam({ name: 'id', example: 1 }),
    ApiOkResponse({
      description: `Get data successfully`,
      schema: {
        type: 'object',
        allOf: [
          { $ref: getSchemaPath(ApiResponseEntity) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(dataDto),
              },
              message: { type: 'string', example: 'Get data successfully' },
            },
          },
        ],
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Internal server error' },
        },
      },
    }),
    HttpCode(HttpStatus.OK),
  );
};

export const ApiFindAll = <DataDto extends Type<unknown>>(dataDto: DataDto) => {
  return applyDecorators(
    ApiParam({ name: 'id', example: 1 }),
    ApiOkResponse({
      description: `Find list data successfully`,
      schema: {
        type: 'object',
        allOf: [
          { $ref: getSchemaPath(ApiResponseArrayEntity) },
          {
            properties: {
              data: {
                type: 'array',
                items: {
                  $ref: getSchemaPath(dataDto),
                },
              },
              message: {
                type: 'string',
                example: 'Find list data successfully',
              },
            },
          },
        ],
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Internal server error' },
        },
      },
    }),
    HttpCode(HttpStatus.OK),
  );
};

export const ApiUpdate = <DataDto extends Type<unknown>>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  bodyDto: Function,
  dataDto: DataDto,
) => {
  return applyDecorators(
    ApiParam({ name: 'id', example: 1 }),
    ApiBody({ type: bodyDto }),
    ApiOkResponse({
      description: 'Update data by id successfully',
      schema: {
        type: 'object',
        allOf: [
          { $ref: getSchemaPath(ApiResponseArrayEntity) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(dataDto),
              },
              message: {
                type: 'string',
                example: 'Update data by id successfully',
              },
            },
          },
        ],
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Internal server error' },
        },
      },
    }),
    HttpCode(HttpStatus.OK),
  );
};

export const ApiDelete = () => {
  return applyDecorators(
    ApiParam({ name: 'id', example: 1 }),
    ApiOkResponse({
      description: 'Delete data by id successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Delete data by id successfully',
          },
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Internal server error' },
        },
      },
    }),
    HttpCode(HttpStatus.OK),
  );
};
