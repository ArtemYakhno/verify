import { SortOrder } from '../../../generated/prisma/internal/prismaNamespace';

export const VALIDATION_RULES = {
  LETTERS_ONLY_REGEX: /^[^\d]+$/,
  PASSWORD_REGEX: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).+$/,
} as const;

export const VALIDATION_MESSAGES = {
  LETTERS_ONLY: 'Must not contain numbers',
  MIN: (count: number = 2) => `Must be at least ${count} characters or equal`,
  MAX: (count: number = 50) => `Must be at most ${count} characters or equal`,
  IS_NOT_EMPTY: 'Must be not be empty',
  IS_STRING: 'Must be string',
  EMAIL_INVALID: 'Please provide a valid email address',
  PASSWORD_MIN: 'Password must be at least 8 characters',
  PASSWORD_COMPLEXITY:
    'Password must contain at least 1 uppercase, 1 lowercase and 1 number',
  IS_POSITIVE: 'Number should be positive',
  IS_INT: 'Should be integer',
  IS_IN: (values: string[]) =>
    `Value should be some of this: ${values.toString()}`,
  IS_DATE: 'Must be a valid ISO 8601 date string',
  IMAGE_COUNT: 'minImages must be less than or equal to maxImages',
  MIN_DATE: (date: string) => `Date can't be less than ${date}`,
  MAX_DATE: (date: string) => `Date can't be older than ${date}`,
  DATE_ORDER: (minDate: string, maxDate: string) =>
    `${minDate} can't be older than ${maxDate}`,
} as const;

export const BASE_PAGINATION_VALIDATION_ERRORS = {
  page: [VALIDATION_MESSAGES.IS_INT, VALIDATION_MESSAGES.MIN(1)],
  perPage: [
    VALIDATION_MESSAGES.IS_INT,
    VALIDATION_MESSAGES.MIN(1),
    VALIDATION_MESSAGES.MAX(50),
  ],
  orderDir: [VALIDATION_MESSAGES.IS_IN(Object.values(SortOrder))],
} satisfies Record<string, string[]>;
