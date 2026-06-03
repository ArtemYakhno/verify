import { applyDecorators } from '@nestjs/common';
import { VALIDATION_MESSAGES } from '../../common/constants/validation.constants';
import { ApiBadRequestError } from '../../common/decorators/swagger.decorator';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { USER_MESSAGES } from '../../common/constants/messages.constants';

export function ApiUserIdParam() {
  return applyDecorators(
    ApiParam({
      name: 'userId',
      type: Number,
      required: true,
      example: 1,
      description: 'User id',
    }),
    UserNotFound(),
  );
}

export function CreateUserValidation() {
  return ApiBadRequestError({
    firstname: [
      VALIDATION_MESSAGES.MIN(2),
      VALIDATION_MESSAGES.MAX(50),
      VALIDATION_MESSAGES.IS_NOT_EMPTY,
      VALIDATION_MESSAGES.IS_STRING,
      VALIDATION_MESSAGES.LETTERS_ONLY,
    ],
    lastname: [
      VALIDATION_MESSAGES.MIN(2),
      VALIDATION_MESSAGES.MAX(50),
      VALIDATION_MESSAGES.IS_NOT_EMPTY,
      VALIDATION_MESSAGES.IS_STRING,
      VALIDATION_MESSAGES.LETTERS_ONLY,
    ],
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

export function InviteUserValidation() {
  return ApiBadRequestError({
    firstname: [
      VALIDATION_MESSAGES.MIN(2),
      VALIDATION_MESSAGES.MAX(50),
      VALIDATION_MESSAGES.IS_NOT_EMPTY,
      VALIDATION_MESSAGES.IS_STRING,
      VALIDATION_MESSAGES.LETTERS_ONLY,
    ],
    lastname: [
      VALIDATION_MESSAGES.MIN(2),
      VALIDATION_MESSAGES.MAX(50),
      VALIDATION_MESSAGES.IS_NOT_EMPTY,
      VALIDATION_MESSAGES.IS_STRING,
      VALIDATION_MESSAGES.LETTERS_ONLY,
    ],
    email: [
      VALIDATION_MESSAGES.IS_NOT_EMPTY,
      VALIDATION_MESSAGES.EMAIL_INVALID,
    ],
  });
}

export function ChangePasswordValidation() {
  return ApiBadRequestError({
    currentPassword: [
      VALIDATION_MESSAGES.IS_NOT_EMPTY,
      VALIDATION_MESSAGES.PASSWORD_MIN,
      VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
      VALIDATION_MESSAGES.IS_STRING,
    ],
    newPassword: [
      VALIDATION_MESSAGES.IS_NOT_EMPTY,
      VALIDATION_MESSAGES.PASSWORD_MIN,
      VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
      VALIDATION_MESSAGES.IS_STRING,
    ],
  });
}

export function UpdateUserValidation() {
  return ApiBadRequestError({
    firstname: [
      VALIDATION_MESSAGES.MIN(2),
      VALIDATION_MESSAGES.MAX(50),
      VALIDATION_MESSAGES.IS_NOT_EMPTY,
      VALIDATION_MESSAGES.IS_STRING,
      VALIDATION_MESSAGES.LETTERS_ONLY,
    ],
    lastname: [
      VALIDATION_MESSAGES.MIN(2),
      VALIDATION_MESSAGES.MAX(50),
      VALIDATION_MESSAGES.IS_NOT_EMPTY,
      VALIDATION_MESSAGES.IS_STRING,
      VALIDATION_MESSAGES.LETTERS_ONLY,
    ],
  });
}

export function UserNotFound() {
  return ApiNotFoundResponse({
    description: USER_MESSAGES.NOT_FOUND_DESCRIPTION,
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: USER_MESSAGES.NOT_FOUND_DESCRIPTION,
        },
      },
    },
  });
}

export function EmailConfliction() {
  return ApiConflictResponse({
    description: USER_MESSAGES.EMAIL_CONFLICT,
    content: {
      'application/json': {
        example: {
          statusCode: 409,
          message: USER_MESSAGES.EMAIL_CONFLICT,
        },
      },
    },
  });
}

export function InvalidCurrentPassword() {
  return ApiUnauthorizedResponse({
    description: USER_MESSAGES.INVALID_CURRENT_PASSWORD,
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: USER_MESSAGES.INVALID_CURRENT_PASSWORD,
        },
      },
    },
  });
}
