export const USER_MESSAGES = {
  EMAIL_CONFLICT: 'Email is already in use',
  NOT_FOUND: (id: number) => `User #${id} not found`,
  NOT_FOUND_DESCRIPTION: 'User not found',
  INVALID_CURRENT_PASSWORD: 'Current password is incorrect',
  INVALID_REGEX_PASSWORD: 'Generated password does not satisfy password policy',
} as const;

export const AUTH_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  INVALID_CREDENTIALS: 'Invalid credentials',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  FORBIDDEN_MESSAGE: 'You do not have access to perform this action',
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

  SAME_GALLERY: 'Source and target galleries must be different',

  MAX_IMAGES: (maxImages: number) =>
    `Gallery can't have more images than ${maxImages}.`,
  MIN_IMAGES: (minImages: number) =>
    `Gallery must have at least ${minImages} images. Please delete the gallery if you want to remove all images.`,
  LIMIT_IMAGES: (minImages: number, maxImages: number) =>
    `You can upload between ${minImages} and ${maxImages} images.`,

  NO_FILES: 'At least one file is required',
  UNSUPORTED_FILE_TYPE: (allowed: string[]) =>
    `Your file type is not allowed. Allowed: ${allowed.join(', ')} `,
  INVALID_FILE_TYPE: 'Only JPEG, PNG and WebP files are allowed',
  LIMIT_FILE_SIZE: 'File is too large',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
  OTHERE_FILE_ERRORS: 'File upload error',
};
