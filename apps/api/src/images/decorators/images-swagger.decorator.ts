import {
  applyDecorators,
  BadRequestException,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ResourceState } from '../../common/types/resource-state.type';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IMAGE_MESSAGES } from '../../common/constants/messages.constants';
import {
  ApiAuth,
  ApiBadRequestError,
} from '../../common/decorators/swagger.decorator';
import { ImageAccessGuard } from '../../common/guards/image-access.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ALLOWED_IMAGES_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGES_PER_GALLERY,
  MAX_IMAGES_PER_RESPONSE,
  MIN_IMAGES_PER_GALLERY,
} from '../../common/constants/limits.constants';
import { MulterExceptionFilter } from '../../common/filters/multer-exception-filter';
import { VALIDATION_MESSAGES } from '../../common/constants/validation.constants';
import { GalleryAccessGuard } from '../../common/guards/gallery-access.guard';
import {
  ApiGalleryIdParam,
  galleryForbiddenExample,
  galleryNotFoundExample,
} from '../../galleries/decorators/galleries-swagger.decorator';

const imageForbiddenExample = {
  summary: 'No access to image',
  value: {
    statusCode: 403,
    message: IMAGE_MESSAGES.FORBIDDEN,
  },
};

const imageNotFoundExample = {
  summary: 'Image not found',
  value: {
    statusCode: 404,
    message: IMAGE_MESSAGES.NOT_FOUND_DESCRIPTION,
  },
};

export const imageConflictMaxImages = {
  summary: 'Max images per gallery',
  value: {
    statusCode: 409,
    message: IMAGE_MESSAGES.MAX_IMAGES(MAX_IMAGES_PER_RESPONSE),
  },
};

export const imageConflictMinImages = {
  summary: 'Min images per gallery',
  value: {
    statusCode: 409,
    message: IMAGE_MESSAGES.MIN_IMAGES(MIN_IMAGES_PER_GALLERY),
  },
};

export const imageConflictSameGallery = {
  summary: 'Same gallery',
  value: {
    statusCode: 409,
    message: IMAGE_MESSAGES.SAME_GALLERY,
  },
};

export function ApiImageIdParam() {
  return ApiParam({
    name: 'imageId',
    type: Number,
    required: true,
    example: 1,
    description: 'Image id',
  });
}

export function ImageAccess(
  GalleryState: ResourceState = 'active',
  ImageState: ResourceState = 'active',
) {
  return applyDecorators(
    UseGuards(
      JwtAuthGuard,
      GalleryAccessGuard(GalleryState),
      ImageAccessGuard(ImageState),
    ),
    ApiAuth(),
    ApiGalleryIdParam(),
    ApiImageIdParam(),
    GalleryOrImageNotFound(),
    GalleryOrImageForbidden(),
  );
}

export function UploadValidation() {
  return ApiBadRequestError({
    noFile: [IMAGE_MESSAGES.NO_FILES],
    maxImages: [IMAGE_MESSAGES.MAX_IMAGES(MAX_IMAGES_PER_GALLERY)],
    invalidFileType: [
      IMAGE_MESSAGES.UNSUPORTED_FILE_TYPE(ALLOWED_IMAGES_TYPES),
    ],
    limitFileSize: [IMAGE_MESSAGES.LIMIT_FILE_SIZE],
    otherFileError: [IMAGE_MESSAGES.OTHERE_FILE_ERRORS],
    name: [VALIDATION_MESSAGES.IS_STRING, VALIDATION_MESSAGES.MAX(50)],
    comment: [VALIDATION_MESSAGES.IS_STRING, VALIDATION_MESSAGES.MAX(100)],
  });
}

export function UploadImage() {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['image'],
        properties: {
          image: { type: 'string', format: 'binary' },
          name: {
            type: 'string',
            nullable: true,
            maxLength: 100,
            example: 'John Snow',
          },
          comment: {
            type: 'string',
            nullable: true,
            maxLength: 100,
            example: 'Conference photo',
          },
        },
      },
    }),
    UseInterceptors(
      FileInterceptor('image', {
        storage: memoryStorage(),
        limits: { fileSize: MAX_FILE_SIZE },
        fileFilter: (_req, file, cb) => {
          if (ALLOWED_IMAGES_TYPES.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(
              new BadRequestException(
                IMAGE_MESSAGES.UNSUPORTED_FILE_TYPE(ALLOWED_IMAGES_TYPES),
              ),
              false,
            );
          }
        },
      }),
    ),
    UseFilters(MulterExceptionFilter),

    UploadValidation(),
  );
}

export function GalleryOrImageForbidden() {
  return ApiForbiddenResponse({
    description: 'Gallery or image access',
    content: {
      'application/json': {
        examples: {
          galleryForbidden: galleryForbiddenExample,
          imageForbidden: imageForbiddenExample,
        },
      },
    },
  });
}

export function GalleryOrImageNotFound() {
  return ApiNotFoundResponse({
    description: 'Gallery or image not found',
    content: {
      'application/json': {
        examples: {
          galleryNotFound: galleryNotFoundExample,
          imageNotFound: imageNotFoundExample,
        },
      },
    },
  });
}

export function MoveCopyValidation() {
  return ApiBadRequestError({
    targetGalleryId: [
      VALIDATION_MESSAGES.IS_INT,
      VALIDATION_MESSAGES.IS_POSITIVE,
      VALIDATION_MESSAGES.IS_NOT_EMPTY,
    ],
  });
}

export function MoveCopyConflicts() {
  return ApiConflictResponse({
    description: 'Coflicts with image actions (move/copy)',
    content: {
      'application/json': {
        examples: {
          maxImages: imageConflictMaxImages,
          minImages: imageConflictMinImages,
          sameGallery: imageConflictSameGallery,
        },
      },
    },
  });
}

export function ImageCountConflicts() {
  return ApiConflictResponse({
    description: 'Coflicts with image coujt',
    content: {
      'application/json': {
        examples: {
          maxImages: imageConflictMaxImages,
          minImages: imageConflictMinImages,
        },
      },
    },
  });
}
