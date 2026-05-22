export const USER_MESSAGES = {
  EMAIL_CONFLICT: 'Email is already in use',
  NOT_FOUND: (id: number) => `User #${id} not found`,
  NOT_FOUND_DESCRIPTION: 'User not found',
  INVALID_CURRENT_PASSWORD: 'Current password is incorrect',
} as const;

export const AUTH_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  INVALID_CREDENTIALS: 'Invalid credentials',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  FORBIDDEN_MESSAGE: 'You do not have access to perform this action',
  UNAUTHORIZED_DESCRIPTION: 'Bearer token is missing or invalid',
} as const;

export const GALLERY_MESSAGES = {
  NOT_FOUND: (id: number) => `Gallery with id ${id} not found`,
  NOT_FOUND_DESCRIPTION: 'Gallery not found',
  FORBIDDEN: 'You are not the owner of this gallery',
};

export const IMAGE_MESSAGES = {
  NOT_FOUND: (id: number) => `Image with id ${id} not found`,
  NOT_FOUND_DESCRIPTION: 'Image not found',
  FORBIDDEN: 'You are not the owner of this image',

  NO_FILES: 'At least one file is required',
  UNSUPORTED_FILE_TYPE: (allowed: string[]) =>
    `Your file type is not allowed. Allowed: ${allowed.join(', ')} `,

  INVALID_FILE_TYPE: 'Only JPEG, PNG and WebP files are allowed',

  SAME_GALLERY_MOVE: 'Cannot move image to the same gallery',
  SAME_GALLERY_COPY: 'Cannot copy image to the same gallery',
  MAX_IMAGES: (currentCount: number, addCount: number, maxImages: number) =>
    `Gallery can have at most ${maxImages} images. Current: ${currentCount}, trying to add: ${addCount}.`,
  MAX_IMAGES_DESCRIPTION: "Gallery can't have more images.",

  LIMIT_FILE_SIZE: 'File is too large',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
  OTHERE_FILE_ERRORS: 'File upload error',
};
