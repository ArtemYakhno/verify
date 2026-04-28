import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_MESSAGES } from '../../common/constants/messages.constants';
import { HashService } from '../../common/services/hash.service';
import { ChangePasswordDto } from './dto/change-password.dto';

const userSelect = {
  id: true,
  firstname: true,
  lastname: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

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
      select: userSelect,
    });
  }

  async findAll() {
    return this.prismaService.user.findMany({
      select: userSelect,
    });
  }

  async findOne(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) throw new NotFoundException(USER_MESSAGES.NOT_FOUND(id));

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
      select: userSelect,
    });
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.prismaService.user.delete({ where: { id } });
    return true;
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        password: true,
      },
    });

    if (!user) throw new NotFoundException(USER_MESSAGES.NOT_FOUND(id));

    const isMatch = await this.hashService.verify(
      user.password,
      changePasswordDto.currentPassword,
    );

    if (!isMatch) {
      throw new UnauthorizedException(USER_MESSAGES.INVALID_CURRENT_PASSWORD);
    }

    const newPassword = await this.hashService.hash(
      changePasswordDto.newPassword,
    );

    await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        password: newPassword,
      },
    });

    return true;
  }
}
