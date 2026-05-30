import { registerDecorator, ValidationOptions } from 'class-validator';

type DateConstraint = Date | (() => Date);

function resolveDate(dateOrFactory: DateConstraint): Date {
  return typeof dateOrFactory === 'function' ? dateOrFactory() : dateOrFactory;
}

export function IsDateOnOrBefore(
  dateOrFactory: DateConstraint,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateOnOrBefore',
      target: object.constructor,
      propertyName,
      constraints: [dateOrFactory],
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (value == null) {
            return true;
          }

          if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
            return false;
          }

          const limit = resolveDate(dateOrFactory);

          if (!(limit instanceof Date) || Number.isNaN(limit.getTime())) {
            return false;
          }

          return value.getTime() <= limit.getTime();
        },
      },
    });
  };
}
