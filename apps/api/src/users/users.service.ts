import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { HashService } from '../common/services/hash.service';
import { USER_MESSAGES } from '../common/constants/messages.constants';
import { safeUserSelect } from '../common/types/user.types';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const exists = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (exists) throw new ConflictException(USER_MESSAGES.EMAIL_CONFLICT);

    const password = await this.hashService.hash(createUserDto.password);

    return this.prismaService.user.create({
      data: { ...createUserDto, password },
      select: safeUserSelect,
    });
  }

  async findAll() {
    return this.prismaService.user.findMany({
      select: safeUserSelect,
    });
  }

  async findById(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: safeUserSelect,
    });

    return user;
  }

  async findByIdOrThrow(userId: number) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException(USER_MESSAGES.NOT_FOUND(userId));
    return user;
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    await this.findByIdOrThrow(userId);

    return this.prismaService.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: safeUserSelect,
    });
  }

  async delete(userId: number) {
    await this.findByIdOrThrow(userId);
    await this.prismaService.user.delete({ where: { id: userId } });
    return true;
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
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
      throw new BadRequestException(USER_MESSAGES.INVALID_CURRENT_PASSWORD);
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
}
