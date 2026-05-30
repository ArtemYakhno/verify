import { ApiBadRequestError } from '../../common/decorators/swagger.decorator';
import { VALIDATION_MESSAGES } from '../../common/constants/validation.constants';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AUTH_MESSAGES } from '../../common/constants/messages.constants';

export function LoginValidation() {
  return ApiBadRequestError({
    email: [
      VALIDATION_MESSAGES.IS_NOT_EMPTY,
      VALIDATION_MESSAGES.EMAIL_INVALID,
    ],
    password: [
      VALIDATION_MESSAGES.IS_NOT_EMPTY,
      VALIDATION_MESSAGES.PASSWORD_MIN,
      VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
      VALIDATION_MESSAGES.IS_STRING,
    ],
  });
}

export function InvalidCredintials() {
  return ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.INVALID_CREDENTIALS,
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: AUTH_MESSAGES.INVALID_CREDENTIALS,
        },
      },
    },
  });
}

export function InvalidToken() {
  return ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
        },
      },
    },
  });
}
