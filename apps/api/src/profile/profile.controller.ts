import {
  Controller,
  Get,
  Patch,
  Body,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiAuth } from '../common/decorators/swagger.decorator';
import {
  UpdateUserValidation,
  UserNotFound,
} from '../users/decorators/user-swagger.decorator';

@ApiTags('Profile')
@ApiAuth()
@Auth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'auth required',
  })
  @UserNotFound()
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  getProfile(@CurrentUser('id') userId: number) {
    return this.usersService.findById(userId);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'auth required',
  })
  @UpdateUserValidation()
  @UserNotFound()
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  updateProfile(@CurrentUser('id') userId: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(userId, dto);
  }

  @Patch('password')
  @ApiOperation({ summary: 'Change password', description: 'auth required' })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  changePassword(
    @CurrentUser('id') userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  @Patch('soft-delete')
  @ApiOperation({
    summary: 'Soft delete current user account',
    description: 'auth required',
  })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  softDelete(@CurrentUser('id') userId: number) {
    return this.usersService.softDelete(userId);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete current user account',
    description: 'auth required',
  })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  deleteProfile(@CurrentUser('id') userId: number) {
    return this.usersService.purge(userId);
  }
}
