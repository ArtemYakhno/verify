import { ValidationArguments } from 'class-validator';
import { validateIsPropertyValid } from '../is-less-than-or-equal.decorator';
import { validateDateOnOrAfter } from '../is-date-on-or-after.decorator';
import { validateDateOnOrBefore } from '../is-date-on-or-before.decorator';

// ─── helpers ───────────────────────────────────────────────────────────────

function makeArgs(
  object: Record<string, unknown>,
  constraints: unknown[],
): ValidationArguments {
  return {
    object,
    constraints,
    value: undefined,
    targetName: 'TestDto',
    property: 'testProp',
  };
}

// ─── IsDateOnOrAfter ───────────────────────────────────────────────────────

describe('validateIsDateOnOrAfter', () => {
  const limit = new Date('2024-01-01');

  it('should return true when value is null', () => {
    expect(validateDateOnOrAfter(null, limit)).toBe(true);
  });

  it('should return true when value is undefined', () => {
    expect(validateDateOnOrAfter(undefined, limit)).toBe(true);
  });

  it('should return false when value is a string', () => {
    expect(validateDateOnOrAfter('2024-06-01', limit)).toBe(false);
  });

  it('should return false when value is an invalid Date', () => {
    expect(validateDateOnOrAfter(new Date('invalid'), limit)).toBe(false);
  });

  it('should return true when value equals limit (boundary)', () => {
    expect(validateDateOnOrAfter(new Date('2024-01-01'), limit)).toBe(true);
  });

  it('should return true when value is after limit', () => {
    expect(validateDateOnOrAfter(new Date('2025-01-01'), limit)).toBe(true);
  });

  it('should return false when value is before limit', () => {
    expect(validateDateOnOrAfter(new Date('2023-01-01'), limit)).toBe(false);
  });

  it('should support factory function as limit', () => {
    const factory = () => new Date('2024-01-01');
    expect(validateDateOnOrAfter(new Date('2025-01-01'), factory)).toBe(true);
  });
});

// ─── IsDateOnOrBefore ──────────────────────────────────────────────────────

describe('validateDateOnOrBefore', () => {
  const limit = new Date('2024-12-31');

  it('should return true when value is null', () => {
    expect(validateDateOnOrBefore(null, limit)).toBe(true);
  });

  it('should return true when value is undefined', () => {
    expect(validateDateOnOrBefore(undefined, limit)).toBe(true);
  });

  it('should return false when value is not a Date', () => {
    expect(validateDateOnOrBefore('2024-06-01', limit)).toBe(false);
  });

  it('should return false when value is an invalid Date', () => {
    expect(validateDateOnOrBefore(new Date('invalid'), limit)).toBe(false);
  });

  it('should return true when value equals limit (boundary)', () => {
    expect(validateDateOnOrBefore(new Date('2024-12-31'), limit)).toBe(true);
  });

  it('should return true when value is before limit', () => {
    expect(validateDateOnOrBefore(new Date('2024-01-01'), limit)).toBe(true);
  });

  it('should return false when value is after limit', () => {
    expect(validateDateOnOrBefore(new Date('2025-06-01'), limit)).toBe(false);
  });
});

// ─── IsPropertyValid ───────────────────────────────────────────────────────

describe('validateIsPropertyValid', () => {
  const compareFn = (a: unknown, b: unknown) => (a as number) <= (b as number);

  it('should return true when value is null', () => {
    const args = makeArgs({ maxAge: 10 }, ['maxAge', compareFn]);
    expect(validateIsPropertyValid(null, args)).toBe(true);
  });

  it('should return true when relatedValue is null', () => {
    const args = makeArgs({ maxAge: null }, ['maxAge', compareFn]);
    expect(validateIsPropertyValid(5, args)).toBe(true);
  });

  it('should return false when relatedPropertyName is not a string', () => {
    const args = makeArgs({}, [123, compareFn]);
    expect(validateIsPropertyValid(5, args)).toBe(false);
  });

  it('should return false when compareFn is not a function', () => {
    const args = makeArgs({ maxAge: 10 }, ['maxAge', 'notAFunction']);
    expect(validateIsPropertyValid(5, args)).toBe(false);
  });

  it('should call compareFn with correct values', () => {
    const mockFn = jest.fn().mockReturnValue(true);
    const args = makeArgs({ maxAge: 10 }, ['maxAge', mockFn]);
    validateIsPropertyValid(5, args);
    expect(mockFn).toHaveBeenCalledWith(5, 10);
  });
});

// ─── IsLessThanOrEqual ─────────────────────────────

describe('validateIsPropertyValid — number comparison', () => {
  const numCompareFn = (v: unknown, r: unknown) =>
    typeof v === 'number' && typeof r === 'number' && v <= r;

  it('should return true when value < relatedValue', () => {
    const args = makeArgs({ max: 10 }, ['max', numCompareFn]);
    expect(validateIsPropertyValid(5, args)).toBe(true);
  });

  it('should return true when value === relatedValue (boundary)', () => {
    const args = makeArgs({ max: 10 }, ['max', numCompareFn]);
    expect(validateIsPropertyValid(10, args)).toBe(true);
  });

  it('should return false when value > relatedValue', () => {
    const args = makeArgs({ max: 10 }, ['max', numCompareFn]);
    expect(validateIsPropertyValid(15, args)).toBe(false);
  });

  it('should return true when value is null', () => {
    const args = makeArgs({ max: 10 }, ['max', numCompareFn]);
    expect(validateIsPropertyValid(null, args)).toBe(true);
  });

  it('should return false when value is not a number', () => {
    const args = makeArgs({ max: 10 }, ['max', numCompareFn]);
    expect(validateIsPropertyValid('five', args)).toBe(false);
  });
});

// ─── IsLessThanOrEqualDate ─────────────────────────

describe('validateIsPropertyValid — date comparison', () => {
  const dateCmp = (v: unknown, r: unknown) =>
    v instanceof Date &&
    !Number.isNaN(v.getTime()) &&
    r instanceof Date &&
    !Number.isNaN(r.getTime()) &&
    v.getTime() <= r.getTime();

  const d = (s: string) => new Date(s);

  it('should return true when value < relatedValue', () => {
    const args = makeArgs({ end: d('2025-12-31') }, ['end', dateCmp]);
    expect(validateIsPropertyValid(d('2025-01-01'), args)).toBe(true);
  });

  it('should return true when value === relatedValue (boundary)', () => {
    const args = makeArgs({ end: d('2025-06-01') }, ['end', dateCmp]);
    expect(validateIsPropertyValid(d('2025-06-01'), args)).toBe(true);
  });

  it('should return false when value > relatedValue', () => {
    const args = makeArgs({ end: d('2025-01-01') }, ['end', dateCmp]);
    expect(validateIsPropertyValid(d('2025-12-31'), args)).toBe(false);
  });

  it('should return true when value is null', () => {
    const args = makeArgs({ end: d('2025-06-01') }, ['end', dateCmp]);
    expect(validateIsPropertyValid(null, args)).toBe(true);
  });

  it('should return false when value is an invalid Date', () => {
    const args = makeArgs({ end: d('2025-06-01') }, ['end', dateCmp]);
    expect(validateIsPropertyValid(d('invalid'), args)).toBe(false);
  });
});
