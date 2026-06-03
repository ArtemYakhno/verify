/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { HashService } from '../../common/services/hash.service';
import { UserInvitationService } from '../../common/services/user-invitation.service';
import { PasswordGeneratorService } from '../../common/services/password-generator.service';
import { GalleriesService } from '../../galleries/galleries.service';
import { MediaCleanupService } from '../../common/services/media-cleanup.service';
import { USER_MESSAGES } from '../../common/constants/messages.constants';
import { DeletionReason } from '../../../generated/prisma/client';
import { SortDirection } from '../../common/types/sort-direction.types';

const mockTx = {
  user: {
    update: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
  gallery: {
    findMany: jest.fn(),
  },
};

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  gallery: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockHashService = {
  hash: jest.fn(),
  verify: jest.fn(),
};

const mockUserInvitationService = {
  sendInviteEmail: jest.fn(),
};

const mockPasswordGeneratorService = {
  generate: jest.fn(),
};

const mockGalleriesService = {
  softDelete: jest.fn(),
  restore: jest.fn(),
  purge: jest.fn(),
};

const mockMediaCleanupService = {
  deleteCloudinaryImages: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: HashService, useValue: mockHashService },
        { provide: UserInvitationService, useValue: mockUserInvitationService },
        {
          provide: PasswordGeneratorService,
          useValue: mockPasswordGeneratorService,
        },
        { provide: GalleriesService, useValue: mockGalleriesService },
        { provide: MediaCleanupService, useValue: mockMediaCleanupService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(
        new NotFoundException(USER_MESSAGES.NOT_FOUND(1)),
      );
    });

    it('should return user if found', async () => {
      const user = { id: 1, email: 'user@test.com' };
      mockPrisma.user.findFirst.mockResolvedValue(user);

      const result = await service.findById(1);

      expect(result).toEqual(user);
    });

    it('should query with deletedAt: null for active state', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 1 });

      await service.findById(1, 'active');

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });

    it('should query with deletedAt: not null for deleted state', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 1 });

      await service.findById(1, 'deleted');

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: { not: null } }),
        }),
      );
    });
  });

  describe('findPart', () => {
    it('should return paginated users', async () => {
      const users = [{ id: 1 }, { id: 2 }];
      mockPrisma.$transaction.mockResolvedValue([users, 2]);

      const result = await service.findPart({
        page: 1,
        perPage: 10,
        orderDir: SortDirection.ASC,
      });

      expect(result.data).toEqual(users);
      expect(result.meta).toMatchObject({
        total: 2,
        page: 1,
        perPage: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });
  });

  describe('create', () => {
    const dto = {
      email: 'new@test.com',
      password: 'Password1',
      firstname: 'John',
      lastname: 'Doe',
    };

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.create(dto)).rejects.toThrow(
        new ConflictException(USER_MESSAGES.EMAIL_CONFLICT),
      );
    });

    it('should hash password and create user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashed');
      mockPrisma.user.create.mockResolvedValue({ id: 1, email: dto.email });

      const result = await service.create(dto);

      expect(mockHashService.hash).toHaveBeenCalledWith('Password1');
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ password: 'hashed' }),
        }),
      );
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('invite', () => {
    it('should generate password, create user and send invite email', async () => {
      mockPasswordGeneratorService.generate.mockReturnValue('TempPass123!');
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashed-temp');
      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        email: 'invited@test.com',
      });

      const dto = {
        email: 'invited@test.com',
        firstname: 'Jane',
        lastname: 'Doe',
      };

      const result = await service.invite(dto);

      expect(mockPasswordGeneratorService.generate).toHaveBeenCalledWith(12);
      expect(mockHashService.hash).toHaveBeenCalledWith('TempPass123!');
      expect(mockUserInvitationService.sendInviteEmail).toHaveBeenCalledWith({
        email: dto.email,
        firstname: dto.firstname,
        temporaryPassword: 'TempPass123!',
      });
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('changePassword', () => {
    const dto = { currentPassword: 'OldPass1', newPassword: 'NewPass1' };

    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.changePassword(1, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if current password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ password: 'hash' });
      mockHashService.verify.mockResolvedValue(false);

      await expect(service.changePassword(1, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should update password and return true', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ password: 'hash' });
      mockHashService.verify.mockResolvedValue(true);
      mockHashService.hash.mockResolvedValue('new-hash');
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.changePassword(1, dto);

      expect(mockHashService.hash).toHaveBeenCalledWith('NewPass1');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'new-hash' },
      });
      expect(result).toBe(true);
    });
  });

  describe('softDelete', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.softDelete(1)).rejects.toThrow(NotFoundException);
    });

    it('should set deletedAt and MANUAL reason, cascade galleries', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 1 });
      mockTx.user.update.mockResolvedValue({});
      mockTx.gallery.findMany.mockResolvedValue([{ id: 10 }, { id: 11 }]);
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<void>) => fn(mockTx),
      );

      const result = await service.softDelete(1);

      expect(mockTx.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deletedAt: expect.any(Date),
            deletionReason: DeletionReason.MANUAL,
          }),
        }),
      );
      expect(mockGalleriesService.softDelete).toHaveBeenCalledTimes(2);
      expect(mockGalleriesService.softDelete).toHaveBeenNthCalledWith(
        1,
        10,
        DeletionReason.INHERIT,
        mockTx,
      );
      expect(mockGalleriesService.softDelete).toHaveBeenNthCalledWith(
        2,
        11,
        DeletionReason.INHERIT,
        mockTx,
      );
      expect(result).toBe(true);
    });
  });

  describe('restore', () => {
    it('should restore user and inherited galleries', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });
      mockTx.user.update.mockResolvedValue({});
      mockTx.gallery.findMany.mockResolvedValue([{ id: 10 }, { id: 11 }]);
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<void>) => fn(mockTx),
      );

      const result = await service.restore(1);

      expect(mockTx.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          deletedAt: null,
          deletionReason: null,
        },
      });
      expect(mockTx.gallery.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          deletedAt: { not: null },
          deletionReason: DeletionReason.INHERIT,
        },
        select: { id: true },
      });
      expect(mockGalleriesService.restore).toHaveBeenCalledTimes(2);
      expect(mockGalleriesService.restore).toHaveBeenNthCalledWith(
        1,
        10,
        mockTx,
      );
      expect(mockGalleriesService.restore).toHaveBeenNthCalledWith(
        2,
        11,
        mockTx,
      );
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when deleted user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.restore(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('purge', () => {
    it('should purge galleries, delete user and cleanup collected cloudinary ids', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });
      mockPrisma.gallery.findMany.mockResolvedValue([{ id: 10 }, { id: 11 }]);
      mockGalleriesService.purge
        .mockResolvedValueOnce(['cloud-1', 'cloud-2'])
        .mockResolvedValueOnce(['cloud-3']);
      mockTx.user.delete.mockResolvedValue({});
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<string[]>) => fn(mockTx),
      );
      mockMediaCleanupService.deleteCloudinaryImages.mockResolvedValue(
        undefined,
      );

      const result = await service.purge(1);

      expect(mockPrisma.gallery.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        select: { id: true },
      });
      expect(mockGalleriesService.purge).toHaveBeenNthCalledWith(1, 10, mockTx);
      expect(mockGalleriesService.purge).toHaveBeenNthCalledWith(2, 11, mockTx);
      expect(mockTx.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(
        mockMediaCleanupService.deleteCloudinaryImages,
      ).toHaveBeenCalledWith(['cloud-1', 'cloud-2', 'cloud-3'], {
        scope: 'user',
        userId: 1,
      });
      expect(result).toBe(true);
    });

    it('should allow purging active user when allowActive is true', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 1, deletedAt: null });
      mockPrisma.gallery.findMany.mockResolvedValue([]);
      mockTx.user.delete.mockResolvedValue({});
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<string[]>) => fn(mockTx),
      );
      mockMediaCleanupService.deleteCloudinaryImages.mockResolvedValue(
        undefined,
      );

      await service.purge(1, { allowActive: true });

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
        }),
      );
      expect(
        mockMediaCleanupService.deleteCloudinaryImages,
      ).toHaveBeenCalledWith([], {
        scope: 'user',
        userId: 1,
      });
    });

    it('should ignore non-array gallery purge results', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });
      mockPrisma.gallery.findMany.mockResolvedValue([{ id: 10 }, { id: 11 }]);
      mockGalleriesService.purge
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(['cloud-3']);
      mockTx.user.delete.mockResolvedValue({});
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<string[]>) => fn(mockTx),
      );
      mockMediaCleanupService.deleteCloudinaryImages.mockResolvedValue(
        undefined,
      );

      await service.purge(1);

      expect(
        mockMediaCleanupService.deleteCloudinaryImages,
      ).toHaveBeenCalledWith(['cloud-3'], {
        scope: 'user',
        userId: 1,
      });
    });
  });
});
