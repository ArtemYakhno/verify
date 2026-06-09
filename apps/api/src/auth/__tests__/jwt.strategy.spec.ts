import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AUTH_MESSAGES } from '../../common/constants/messages.constants';
import { JwtStrategy } from '../strategies/jwt.strategy';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
};

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('access-secret'),
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    strategy = new JwtStrategy(
      mockPrisma as unknown as PrismaService,
      mockConfigService as unknown as ConfigService,
    );
  });

  const payload = { sub: 1, version: 'v1' };

  it('should throw if user not found (soft-deleted)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(
      new UnauthorizedException(AUTH_MESSAGES.UNAUTHORIZED),
    );
  });

  it('should throw if tokenVersion does not match', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      tokenVersion: 'old-version',
    });

    await expect(strategy.validate(payload)).rejects.toThrow(
      new UnauthorizedException(AUTH_MESSAGES.UNAUTHORIZED),
    );
  });

  it('should return user without tokenVersion on success', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'user@test.com',
      tokenVersion: 'v1',
    });

    const result = await strategy.validate(payload);

    expect(result).toEqual({ id: 1, email: 'user@test.com' });
    expect(result).not.toHaveProperty('tokenVersion');
  });
});
