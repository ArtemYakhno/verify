import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { HashService } from '../common/services/hash.service';
import { USER_MESSAGES } from '../common/constants/messages.constants';
import { userSelect } from '../common/types/user.types';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { notDeletedWhere } from '../common/constants/constraints.constants';
import { ResourceState } from '../common/types/resource-state.type';
import { InviteUserDto } from './dto/invite-user.dto';
import { UserInvitationService } from '../common/services/user-invitation.service';
import { PasswordGeneratorService } from '../common/services/password-generator.service';
import { CreateUserBase } from './types/create-user-base.types';
import { GalleriesService } from '../galleries/galleries.service';
import { DeletionReason, Prisma } from '../../generated/prisma/client';
import { MediaCleanupService } from '../common/services/media-cleanup.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
    private readonly userInvitationService: UserInvitationService,
    private readonly passwordGeneratorService: PasswordGeneratorService,
    private readonly galleriesService: GalleriesService,
    private readonly mediaCleanupService: MediaCleanupService,
  ) {}

  async findPart(query: PaginationQueryDto) {
    const { page, perPage, orderDir = 'desc' } = query;
    const skip = (page - 1) * perPage;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where: { ...notDeletedWhere },
        skip,
        take: perPage,
        orderBy: { createdAt: orderDir },
        select: userSelect,
      }),
      this.prismaService.user.count({ where: { ...notDeletedWhere } }),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return {
      data,
      meta: {
        total,
        page,
        perPage,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(userId: number, state: ResourceState = 'active') {
    const where: Prisma.UserWhereInput =
      state === 'active'
        ? { id: userId, deletedAt: null }
        : state === 'deleted'
          ? { id: userId, deletedAt: { not: null } }
          : { id: userId };

    const user = await this.prismaService.user.findFirst({
      where,
      select: userSelect,
    });
    if (!user) throw new NotFoundException(USER_MESSAGES.NOT_FOUND(userId));
    return user;
  }

  async findDeleted() {
    return await this.prismaService.user.findMany({
      where: { deletedAt: { not: null } },
      select: userSelect,
    });
  }

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    return this.createUserWithPassword(userData, password);
  }

  async invite(inviteUserDto: InviteUserDto) {
    const temporaryPassword = this.passwordGeneratorService.generate(12);
    const user = await this.createUserWithPassword(
      inviteUserDto,
      temporaryPassword,
    );

    try {
      await this.userInvitationService.sendInviteEmail({
        email: inviteUserDto.email,
        firstname: inviteUserDto.firstname,
        temporaryPassword,
      });
    } catch (error) {
      await this.prismaService.user.delete({ where: { id: user.id } });
      throw error;
    }

    return user;
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    await this.findById(userId);

    return this.prismaService.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: userSelect,
    });
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
        ...notDeletedWhere,
      },
      select: {
        password: true,
      },
    });

    if (!user) throw new NotFoundException(USER_MESSAGES.NOT_FOUND(userId));

    const isMatch = await this.hashService.verify(
      user.password,
      changePasswordDto.currentPassword,
    );

    if (!isMatch) {
      throw new UnauthorizedException({
        message: 'Validation failed',
        errors: {
          currentPassword: [USER_MESSAGES.INVALID_CURRENT_PASSWORD],
        },
      });
    }

    const newPassword = await this.hashService.hash(
      changePasswordDto.newPassword,
    );

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newPassword,
      },
    });

    return true;
  }

  async softDelete(userId: number) {
    await this.findById(userId);

    await this.prismaService.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          deletionReason: DeletionReason.MANUAL,
        },
      });

      const galleries = await tx.gallery.findMany({
        where: { userId, deletedAt: null },
        select: { id: true },
      });

      for (const gallery of galleries) {
        await this.galleriesService.softDelete(
          gallery.id,
          DeletionReason.INHERIT,
          tx,
        );
      }
    });

    return true;
  }

  async restore(userId: number) {
    await this.findById(userId, 'deleted');

    await this.prismaService.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: null,
          deletionReason: null,
        },
      });

      const galleries = await tx.gallery.findMany({
        where: {
          userId,
          deletedAt: { not: null },
          deletionReason: DeletionReason.INHERIT,
        },
        select: { id: true },
      });

      for (const gallery of galleries) {
        await this.galleriesService.restore(gallery.id, tx);
      }
    });

    return true;
  }

  async purge(userId: number, options?: { allowActive?: boolean }) {
    await this.findById(userId, options?.allowActive ? 'any' : 'deleted');

    const galleries = await this.prismaService.gallery.findMany({
      where: { userId },
      select: { id: true },
    });

    const cloudinaryIds = await this.prismaService.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const collectedCloudinaryIds: string[] = [];

        for (const gallery of galleries) {
          const ids = await this.galleriesService.purge(gallery.id, tx);

          if (Array.isArray(ids)) {
            collectedCloudinaryIds.push(...ids);
          }
        }

        await tx.user.delete({
          where: { id: userId },
        });

        return collectedCloudinaryIds;
      },
    );

    await this.mediaCleanupService.deleteCloudinaryImages(cloudinaryIds, {
      scope: 'user',
      userId,
    });

    return true;
  }

  private async createUserWithPassword(
    userData: CreateUserBase,
    rawPassword: string,
  ) {
    const exists = await this.prismaService.user.findUnique({
      where: { email: userData.email },
      select: { id: true },
    });

    if (exists) {
      throw new ConflictException({
        message: USER_MESSAGES.EMAIL_CONFLICT,
        errors: {
          email: [USER_MESSAGES.EMAIL_CONFLICT],
        },
      });
    }

    const hashedPassword = await this.hashService.hash(rawPassword);

    return this.prismaService.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: userSelect,
    });
  }
}
