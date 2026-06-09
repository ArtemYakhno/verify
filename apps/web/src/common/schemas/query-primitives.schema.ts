import z from "zod";
import { ORDER_DIR } from "../constants/pagination.constants";

export const createSortingQuerySchema = <
  T extends readonly [string, ...string[]],
>(
  orderBy: T,
  defaultOrderBy: T[number],
) =>
  z.object({
    orderBy: z.enum(orderBy).catch(defaultOrderBy),
    orderDir: z.enum(ORDER_DIR).catch(ORDER_DIR[1]),
  });

export const createIntRangeQuerySchema = (
  min: number,
  max: number,
  defaultValue: number,
) =>
  z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return defaultValue;
    }

    return value;
  }, z.coerce.number().int().min(min).max(max).catch(defaultValue).optional());

export const optionalDateQuerySchema = z.preprocess((value) => {
  if (
    value === "" ||
    value === null ||
    value === undefined ||
    typeof value !== "string"
  ) {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  return Number.isNaN(new Date(trimmedValue).getTime())
    ? undefined
    : trimmedValue;
}, z.string().optional());

export const optionalStringQuerySchema = z
  .string()
  .catch("")
  .transform((value) => value.trim());
