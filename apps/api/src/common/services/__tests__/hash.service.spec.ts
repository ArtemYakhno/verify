import { HashService } from '../hash.service';

describe('HashService', () => {
  let service: HashService;

  beforeEach(() => {
    service = new HashService();
  });

  describe('hash', () => {
    it('should return a string', async () => {
      const result = await service.hash('password123');
      expect(typeof result).toBe('string');
    });

    it('should not return the original password', async () => {
      const result = await service.hash('password123');
      expect(result).not.toBe('password123');
    });

    it('should return different hashes for the same password', async () => {
      const hash1 = await service.hash('password123');
      const hash2 = await service.hash('password123');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verify', () => {
    it('should return true for correct password', async () => {
      const hash = await service.hash('password123');
      const result = await service.verify(hash, 'password123');
      expect(result).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const hash = await service.hash('password123');
      const result = await service.verify(hash, 'wrongPassword');
      expect(result).toBe(false);
    });

    it('should return false for empty string', async () => {
      const hash = await service.hash('password123');
      const result = await service.verify(hash, '');
      expect(result).toBe(false);
    });
  });
});
