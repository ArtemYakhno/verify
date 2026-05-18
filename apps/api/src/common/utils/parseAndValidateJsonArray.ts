import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidatorOptions } from 'class-validator';

type ClassConstructor<T extends object> = new () => T;

export async function parseAndValidateJsonArray<T extends object>(
  raw: string,
  dtoClass: ClassConstructor<T>,
  errorMessage: string,
  validatorOptions?: ValidatorOptions,
): Promise<T[]> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new BadRequestException(errorMessage);
  }

  if (!Array.isArray(parsed)) {
    throw new BadRequestException(errorMessage);
  }

  const instances = plainToInstance(dtoClass, parsed);

  const errors = await Promise.all(
    instances.map((item) =>
      validate(item, {
        whitelist: true,
        forbidNonWhitelisted: true,
        ...validatorOptions,
      }),
    ),
  );

  const hasErrors = errors.some((item) => item.length > 0);

  if (hasErrors) {
    throw new BadRequestException(errorMessage);
  }

  return instances;
}
