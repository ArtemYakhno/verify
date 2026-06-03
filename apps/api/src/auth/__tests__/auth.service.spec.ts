import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { HashService } from '../../common/services/hash.service';
import { AUTH_MESSAGES } from '../../common/constants/messages.constants';
import { Response } from 'express';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockUsersService = {
  create: jest.fn(),
};

const mockHashService = {
  hash: jest.fn(),
  verify: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockConfigService = {
  getOrThrow: jest.fn((key: string) => {
    const config: Record<string, string> = {
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_ACCESS_TOKEN_TTL: '900',
      JWT_REFRESH_TOKEN_TTL: '604800',
      COOKIE_DOMAIN: 'localhost',
      NODE_ENV: 'test',
    };
    return config[key];
  }),
};

type MockResponse = {
  cookie: jest.Mock;
  clearCookie: jest.Mock;
};

function makeMockResponse(): MockResponse {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UsersService, useValue: mockUsersService },
        { provide: HashService, useValue: mockHashService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  // ─── login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    const dto = { email: 'user@test.com', password: 'Password1' };

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const res = makeMockResponse();

      await expect(
        service.login(dto, res as unknown as Response),
      ).rejects.toThrow(
        new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS),
      );
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, password: 'hash' });
      mockHashService.verify.mockResolvedValue(false);
      const res = makeMockResponse();

      await expect(
        service.login(dto, res as unknown as Response),
      ).rejects.toThrow(
        new UnauthorizedException({
          message: AUTH_MESSAGES.INVALID_CREDENTIALS,
          errors: {
            password: [AUTH_MESSAGES.INVALID_CREDENTIALS],
            email: [AUTH_MESSAGES.INVALID_CREDENTIALS],
          },
        }),
      );
    });

    it('should return accessToken on success', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, password: 'hash' });
      mockHashService.verify.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');
      mockHashService.hash.mockResolvedValue('hashed-refresh');
      mockPrisma.user.update.mockResolvedValue({});
      const res = makeMockResponse();

      const result = await service.login(dto, res as unknown as Response);
      const { cookie } = res;

      expect(result).toHaveProperty('accessToken');
      expect(cookie).toHaveBeenCalled();
    });
  });

  // ─── refresh ──────────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('should throw if jwt.verify throws', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error();
      });
      const res = makeMockResponse();

      await expect(
        service.refresh('bad-token', res as unknown as Response),
      ).rejects.toThrow(
        new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN),
      );
    });

    it('should throw if user not found (soft-deleted)', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 1, version: 'v1' });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const res = makeMockResponse();

      await expect(
        service.refresh('token', res as unknown as Response),
      ).rejects.toThrow(
        new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN),
      );
    });

    it('should throw if stored refreshToken is null', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 1, version: 'v1' });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        refreshToken: null,
      });
      const res = makeMockResponse();

      await expect(
        service.refresh('token', res as unknown as Response),
      ).rejects.toThrow(
        new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN),
      );
    });

    it('should throw if token hash does not match', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 1, version: 'v1' });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        refreshToken: 'stored-hash',
      });
      mockHashService.verify.mockResolvedValue(false);
      const res = makeMockResponse();

      await expect(
        service.refresh('token', res as unknown as Response),
      ).rejects.toThrow(
        new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN),
      );
    });

    it('should return accessToken on success', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 1, version: 'v1' });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        refreshToken: 'stored-hash',
      });
      mockHashService.verify.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('new-token');
      mockHashService.hash.mockResolvedValue('new-hash');
      mockPrisma.user.update.mockResolvedValue({});
      const res = makeMockResponse();

      const result = await service.refresh('token', res as unknown as Response);

      expect(result).toHaveProperty('accessToken');
    });
  });

  // ─── logout ───────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should clear cookie and return true', async () => {
      mockPrisma.user.update.mockResolvedValue({});
      const res = makeMockResponse();

      const result = await service.logout(res as unknown as Response, 1);

      expect(res.clearCookie).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
