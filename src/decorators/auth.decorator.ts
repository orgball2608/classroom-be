import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UseGuards, applyDecorators } from '@nestjs/common';

import { AccessTokenGuard } from '../guards/access-token.guard';

export function Auth() {
  return applyDecorators(
    UseGuards(AccessTokenGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
  );
}
