import {
  Controller,
  Get,
  Patch,
  Body,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import {
  AUTH_MESSAGES,
  USER_MESSAGES,
} from '../common/constants/messages.constants';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Profile')
@ApiUnauthorizedResponse({
  description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
})
@ApiNotFoundResponse({ description: USER_MESSAGES.NOT_FOUND_DESCRIPTION })
@ApiBearerAuth()
@Auth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  getProfile(@CurrentUser('id') userId: number) {
    return this.usersService.findByIdOrThrow(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  updateProfile(@CurrentUser('id') userId: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(userId, dto);
  }

  @Patch('password')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: USER_MESSAGES.INVALID_CURRENT_PASSWORD,
  })
  changePassword(
    @CurrentUser('id') userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  deleteProfile(@CurrentUser('id') userId: number) {
    return this.usersService.delete(userId);
  }
}
