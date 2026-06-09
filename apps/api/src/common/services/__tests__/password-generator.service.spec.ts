import { PasswordGeneratorService } from '../password-generator.service';
import { VALIDATION_RULES } from '../../constants/validation.constants';

describe('PasswordGeneratorService', () => {
  let service: PasswordGeneratorService;

  beforeEach(() => {
    service = new PasswordGeneratorService();
  });

  describe('generate', () => {
    it('should return a string', () => {
      expect(typeof service.generate()).toBe('string');
    });

    it('should return password of default length 12', () => {
      expect(service.generate()).toHaveLength(12);
    });

    it('should return password of custom length', () => {
      expect(service.generate(16)).toHaveLength(16);
    });

    it('should throw if length is less than 8', () => {
      expect(() => service.generate(7)).toThrow(
        'Password length must be at least 8',
      );
    });

    it('should pass PASSWORD_REGEX validation', () => {
      const password = service.generate();
      expect(VALIDATION_RULES.PASSWORD_REGEX.test(password)).toBe(true);
    });

    it('should contain at least one uppercase letter', () => {
      const password = service.generate();
      expect(/[A-Z]/.test(password)).toBe(true);
    });

    it('should contain at least one lowercase letter', () => {
      const password = service.generate();
      expect(/[a-z]/.test(password)).toBe(true);
    });

    it('should contain at least one digit', () => {
      const password = service.generate();
      expect(/[0-9]/.test(password)).toBe(true);
    });

    it('should generate different passwords each time', () => {
      const results = new Set(
        Array.from({ length: 10 }, () => service.generate()),
      );
      expect(results.size).toBeGreaterThan(1);
    });
  });
});
