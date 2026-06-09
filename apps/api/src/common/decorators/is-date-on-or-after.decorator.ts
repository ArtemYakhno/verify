import { registerDecorator, ValidationOptions } from 'class-validator';
import { DateConstraint, resolveDate } from '../utils/resolveDate.util';

export function validateDateOnOrAfter(
  value: unknown,
  dateOrFactory: DateConstraint,
): boolean {
  if (value == null) return true;
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return false;
  const limit = resolveDate(dateOrFactory);
  if (!(limit instanceof Date) || Number.isNaN(limit.getTime())) return false;
  return value.getTime() >= limit.getTime();
}

export function IsDateOnOrAfter(
  dateOrFactory: DateConstraint,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateOnOrAfter',
      target: object.constructor,
      propertyName,
      constraints: [dateOrFactory],
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return validateDateOnOrAfter(value, dateOrFactory);
        },
      },
    });
  };
}
