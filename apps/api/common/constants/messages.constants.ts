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
