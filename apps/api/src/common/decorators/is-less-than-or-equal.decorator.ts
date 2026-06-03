import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

type CompareFn = (value: unknown, relatedValue: unknown) => boolean;

function isCompareFn(value: unknown): value is CompareFn {
  return typeof value === 'function';
}

export function IsPropertyValid(
  property: string,
  compare: CompareFn,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPropertyValid',
      target: object.constructor,
      propertyName,
      constraints: [property, compare],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const constraints = args.constraints as unknown[];
          const relatedPropertyName = constraints[0];
          const compareFn = constraints[1];

          if (typeof relatedPropertyName !== 'string') {
            return false;
          }

          if (!isCompareFn(compareFn)) {
            return false;
          }

          const objectRecord = args.object as Record<string, unknown>;
          const relatedValue = objectRecord[relatedPropertyName];

          if (value == null || relatedValue == null) {
            return true;
          }

          return compareFn(value, relatedValue);
        },
      },
    });
  };
}

export function IsLessThanOrEqual(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return IsPropertyValid(
    property,
    (value, relatedValue) =>
      typeof value === 'number' &&
      typeof relatedValue === 'number' &&
      value <= relatedValue,
    validationOptions,
  );
}

export function IsLessThanOrEqualDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return IsPropertyValid(
    property,
    (value, relatedValue) =>
      value instanceof Date &&
      !Number.isNaN(value.getTime()) &&
      relatedValue instanceof Date &&
      !Number.isNaN(relatedValue.getTime()) &&
      value.getTime() <= relatedValue.getTime(),
    validationOptions,
  );
}
