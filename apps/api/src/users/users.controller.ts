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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUsersDto, UserResponseDto } from './dto/user-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Role } from '../../generated/prisma/enums';
import { Auth } from '../common/decorators/auth.decorator';
import { ApiBadRequestError } from '../common/decorators/swagger.decorator';
import {
  CreateUserValidation,
  UpdateUserValidation,
  EmailConfliction,
  InvalidCurrentPassword,
  ChangePasswordValidation,
  ApiUserIdParam,
  InviteUserValidation,
} from './decorators/user-swagger.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { BASE_PAGINATION_VALIDATION_ERRORS } from '../common/constants/validation.constants';
import { InviteUserDto } from './dto/invite-user.dto';

@ApiTags('Users')
@Auth(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiBadRequestError(BASE_PAGINATION_VALIDATION_ERRORS)
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedUsersDto })
  findPart(@Query() query: PaginationQueryDto) {
    return this.usersService.findPart(query);
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Get a user by ID',
    description: 'admin only, auth required',
  })
  @ApiUserIdParam()
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  findOne(@Param('userId', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a user',
    description: 'admin only, auth required',
  })
  @CreateUserValidation()
  @EmailConfliction()
  @ApiResponse({ status: HttpStatus.CREATED, type: UserResponseDto })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Post('invite')
  @ApiOperation({
    summary: 'Invite a user',
    description: 'admin only, auth required',
  })
  @InviteUserValidation()
  @EmailConfliction()
  @ApiResponse({ status: HttpStatus.CREATED, type: UserResponseDto })
  invite(@Body() dto: InviteUserDto) {
    return this.usersService.invite(dto);
  }

  @Patch(':userId')
  @ApiOperation({
    summary: 'Update a user',
    description: 'admin only, auth required',
  })
  @ApiUserIdParam()
  @UpdateUserValidation()
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  update(
    @Param('userId', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Patch(':userId/change-password')
  @ApiOperation({
    summary: 'Change user password',
    description: 'admin only, auth required',
  })
  @ApiUserIdParam()
  @ChangePasswordValidation()
  @InvalidCurrentPassword()
  @ApiResponse({
    status: HttpStatus.OK,
    type: Boolean,
  })
  changePassword(
    @Param('userId', ParseIntPipe) id: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(id, dto);
  }

  @ApiOperation({
    summary: 'Soft delete a user',
    description: 'admin only, auth required',
  })
  @ApiUserIdParam()
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @Patch(':userId/soft-delete')
  softDelete(@Param('userId', ParseIntPipe) id: number) {
    return this.usersService.softDelete(id);
  }

  @ApiOperation({
    summary: 'Purge delete a user',
    description: 'admin only, auth required',
  })
  @ApiUserIdParam()
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @Delete(':userId')
  purge(@Param('userId', ParseIntPipe) id: number) {
    return this.usersService.purge(id);
  }

  @Patch(':userId/restore')
  @ApiOperation({
    summary: 'Restore user',
    description: 'admin only, auth required',
  })
  @ApiUserIdParam()
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  restore(@Param('userId', ParseIntPipe) id: number) {
    return this.usersService.restore(id);
  }
}
