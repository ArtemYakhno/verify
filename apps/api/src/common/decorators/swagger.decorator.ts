import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AUTH_MESSAGES } from '../constants/messages.constants';

export function ApiAuth() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: AUTH_MESSAGES.UNAUTHORIZED,
      content: {
        'application/json': {
          example: {
            statusCode: 401,
            message: AUTH_MESSAGES.UNAUTHORIZED,
          },
        },
      },
    }),
  );
}

export function ApiAuthRole() {
  return applyDecorators(
    ApiAuth(),
    ApiForbiddenResponse({
      description: AUTH_MESSAGES.FORBIDDEN_MESSAGE,
      content: {
        'application/json': {
          example: {
            statusCode: 403,
            message: AUTH_MESSAGES.FORBIDDEN_MESSAGE,
          },
        },
      },
    }),
  );
}

export function ApiBadRequestError(example?: Record<string, string[]>) {
  return ApiBadRequestResponse({
    description: 'Validation failed',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Validation failed',
          errors: example ?? {
            field: ['Validation error message'],
          },
        },
      },
    },
  });
}
