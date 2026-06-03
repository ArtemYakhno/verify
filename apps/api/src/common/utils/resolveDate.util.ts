export type DateConstraint = Date | (() => Date);

export function resolveDate(dateOrFactory: DateConstraint): Date {
  return typeof dateOrFactory === 'function' ? dateOrFactory() : dateOrFactory;
}
