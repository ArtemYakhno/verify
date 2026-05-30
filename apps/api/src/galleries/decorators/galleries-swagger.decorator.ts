import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { GALLERY_MESSAGES } from '../../common/constants/messages.constants';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResourceState } from '../../common/types/resource-state.type';
import { GalleryAccessGuard } from '../../common/guards/gallery-access.guard';
import {
  ApiAuth,
  ApiBadRequestError,
} from '../../common/decorators/swagger.decorator';
import {
  BASE_PAGINATION_VALIDATION_ERRORS,
  VALIDATION_MESSAGES,
} from '../../common/constants/validation.constants';
import { GalleryOrderBy } from '../types/gallery-order-by.type';

export const galleryNotFoundExample = {
  summary: 'Gallery not found',
  value: {
    statusCode: 404,
    message: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION,
  },
};

export const galleryForbiddenExample = {
  summary: 'No access to gallery',
  value: {
    statusCode: 403,
    message: GALLERY_MESSAGES.FORBIDDEN,
  },
};

export function ApiGalleryIdParam() {
  return ApiParam({
    name: 'galleryId',
    type: Number,
    required: true,
    example: 1,
    description: 'Gallery id',
  });
}

export function GalleryAccess(state: ResourceState = 'active') {
  return applyDecorators(
    UseGuards(JwtAuthGuard, GalleryAccessGuard(state)),
    ApiAuth(),
    ApiGalleryIdParam(),
    GalleryNotFound(),
    GalleryForbidden(),
  );
}

export function GalleryValidation() {
  return ApiBadRequestError({
    title: [
      VALIDATION_MESSAGES.MIN(2),
      VALIDATION_MESSAGES.MAX(50),
      VALIDATION_MESSAGES.IS_NOT_EMPTY,
      VALIDATION_MESSAGES.IS_STRING,
    ],
    description: [VALIDATION_MESSAGES.MAX(255), VALIDATION_MESSAGES.IS_STRING],
  });
}

export function GalleryNotFound() {
  return ApiNotFoundResponse({
    description: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION,
    content: {
      'application/json': {
        examples: {
          galleryNotFound: galleryNotFoundExample,
        },
      },
    },
  });
}

export function GalleryForbidden() {
  return ApiForbiddenResponse({
    description: GALLERY_MESSAGES.FORBIDDEN,
    content: {
      'application/json': {
        examples: {
          galleryNotFound: galleryForbiddenExample,
        },
      },
    },
  });
}

export function GalleryPaginationValidation() {
  return ApiBadRequestError({
    ...BASE_PAGINATION_VALIDATION_ERRORS,
    search: [VALIDATION_MESSAGES.MAX(50), VALIDATION_MESSAGES.IS_STRING],
    createdFrom: [
      VALIDATION_MESSAGES.IS_DATE,
      VALIDATION_MESSAGES.MIN_DATE('2000-01-01'),
      VALIDATION_MESSAGES.MAX_DATE('today'),
      VALIDATION_MESSAGES.DATE_ORDER('createdFrom', 'createdTo'),
    ],
    createdTo: [
      VALIDATION_MESSAGES.IS_DATE,
      VALIDATION_MESSAGES.MIN_DATE('2000-01-01'),
      VALIDATION_MESSAGES.MAX_DATE('today'),
    ],
    minImages: [
      VALIDATION_MESSAGES.IS_INT,
      VALIDATION_MESSAGES.MIN(0),
      VALIDATION_MESSAGES.MIN(50),
      VALIDATION_MESSAGES.IMAGE_COUNT,
    ],
    maxImages: [
      VALIDATION_MESSAGES.IS_INT,
      VALIDATION_MESSAGES.MIN(0),
      VALIDATION_MESSAGES.MIN(50),
    ],
    orderBy: [VALIDATION_MESSAGES.IS_IN(Object.values(GalleryOrderBy))],
  });
}
