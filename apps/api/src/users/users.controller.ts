import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

import { ChangePasswordDto } from './dto/change-password.dto';
import { Role } from '../../generated/prisma/enums';
import {
  AUTH_MESSAGES,
  USER_MESSAGES,
} from '../common/constants/messages.constants';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Users')
@ApiUnauthorizedResponse({
  description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
})
@ApiForbiddenResponse({ description: AUTH_MESSAGES.FORBIDDEN_MESSAGE })
@ApiBearerAuth()
@Auth(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UserResponseDto })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: USER_MESSAGES.EMAIL_CONFLICT,
  })
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserResponseDto] })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: USER_MESSAGES.NOT_FOUND_DESCRIPTION,
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findByIdOrThrow(id);
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: USER_MESSAGES.NOT_FOUND_DESCRIPTION,
  })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: USER_MESSAGES.NOT_FOUND_DESCRIPTION,
  })
  @ApiConflictResponse({ description: USER_MESSAGES.DELETE_ALL_RELATIVE_DATA })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }

  @ApiOperation({ summary: 'Change user password' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: USER_MESSAGES.INVALID_CURRENT_PASSWORD,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: USER_MESSAGES.NOT_FOUND_DESCRIPTION,
  })
  @Patch(':id/change-password')
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(id, dto);
  }
}
