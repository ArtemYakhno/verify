export const USER_MESSAGES = {
  EMAIL_CONFLICT: 'Email is already in use',
  NOT_FOUND: (id: number) => `User #${id} not found`,
  NOT_FOUND_DESCRIPTION: 'User not found',
  INVALID_CURRENT_PASSWORD: 'Current password is incorrect',
} as const;

export const AUTH_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized',
} as const;
