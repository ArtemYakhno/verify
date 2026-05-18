import { Controller, Post, Body, Res, Req, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  AUTH_MESSAGES,
  USER_MESSAGES,
} from '../common/constants/messages.constants';
import { REFRESH_TOKEN_COOKIE } from '../common/constants/cookie.constants';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AuthResponseDto })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: USER_MESSAGES.EMAIL_CONFLICT,
  })
  @Post('register')
  register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(res, dto);
  }

  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: AUTH_MESSAGES.INVALID_CREDENTIALS,
  })
  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
  })
  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE] as string;
    return this.authService.refresh(refreshToken, res);
  }

  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: AUTH_MESSAGES.INVALID_CREDENTIALS,
  })
  @Post('logout')
  logout(
    @CurrentUser('id') userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(res, userId);
  }
}
