import { Prisma } from '../../../generated/prisma/client';

export const userSelect = {
  id: true,
  firstname: true,
  lastname: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type User = Prisma.UserGetPayload<{ select: typeof userSelect }>;
