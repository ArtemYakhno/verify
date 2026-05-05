export const VALIDATION_RULES = {
  LETTERS_ONLY_REGEX: /^[^\d]+$/,
  PASSWORD_REGEX: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).+$/,
} as const;

export const VALIDATION_MESSAGES = {
  LETTERS_ONLY: 'Must not contain numbers',
  MIN_2: 'Must be at least 2 characters',
  MAX_50: 'Must be at most 50 characters',
  EMAIL_INVALID: 'Please provide a valid email address',
  PASSWORD_MIN: 'Password must be at least 8 characters',
  PASSWORD_COMPLEXITY:
    'Password must contain at least 1 uppercase, 1 lowercase and 1 number',
} as const;
