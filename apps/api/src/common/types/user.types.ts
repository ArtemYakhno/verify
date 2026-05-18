import { Prisma } from '../../../generated/prisma/client';

export const safeUserSelect = {
  id: true,
  firstname: true,
  lastname: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;
