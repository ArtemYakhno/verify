import { Controller, Post, Body, Res, Req, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { REFRESH_TOKEN_COOKIE } from '../common/constants/cookie.constants';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  CreateUserValidation,
  EmailConfliction,
} from '../users/decorators/user-swagger.decorator';
import { ApiAuth } from '../common/decorators/swagger.decorator';
import {
  InvalidCredintials,
  InvalidToken,
  LoginValidation,
} from './decorators/auth-swagger.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @CreateUserValidation()
  @EmailConfliction()
  @ApiResponse({ status: HttpStatus.CREATED, type: AuthResponseDto })
  register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(res, dto);
  }

  @ApiOperation({ summary: 'Login' })
  @LoginValidation()
  @InvalidCredintials()
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @InvalidToken()
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE] as string;
    return this.authService.refresh(refreshToken, res);
  }

  @Auth()
  @ApiOperation({ summary: 'Logout', description: 'auth required' })
  @ApiAuth()
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @Post('logout')
  logout(
    @CurrentUser('id') userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(res, userId);
  }
}
