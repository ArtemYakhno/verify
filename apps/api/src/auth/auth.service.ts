import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { HashService } from '../../common/services/hash.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { Response } from 'express';
import { isDev } from '../../common/utils/is-dev.util';
import { REFRESH_TOKEN_COOKIE } from '../../common/constants/cookie.constants';
import { AUTH_MESSAGES } from '../../common/constants/messages.constants';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly jwtAccessSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly accessTokenTtl: number;
  private readonly refreshTokenTtl: number;
  private readonly cookieDomain: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtAccessSecret = configService.getOrThrow('JWT_ACCESS_SECRET');
    this.jwtRefreshSecret = configService.getOrThrow('JWT_REFRESH_SECRET');
    this.accessTokenTtl = Number(
      configService.getOrThrow('JWT_ACCESS_TOKEN_TTL'),
    );
    this.refreshTokenTtl = Number(
      configService.getOrThrow('JWT_REFRESH_TOKEN_TTL'),
    );
    this.cookieDomain = configService.getOrThrow('COOKIE_DOMAIN');
  }

  async register(res: Response, createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return this.auth(res, user.id);
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const isMatch = await this.hashService.verify(user.password, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    return this.auth(res, user.id);
  }

  async refresh(refreshToken: string, res: Response) {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.jwtRefreshSecret,
        ignoreExpiration: false,
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        refreshToken: true,
      },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const { refreshToken: storedToken } = user;

    const isMatch = await this.hashService.verify(storedToken, refreshToken);

    if (!isMatch) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    return this.auth(res, user.id);
  }

  async logout(res: Response, userId: number) {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
        tokenVersion: { increment: 1 },
      },
    });

    res.clearCookie(REFRESH_TOKEN_COOKIE);

    return true;
  }

  private async auth(res: Response, userId: number) {
    const { tokenVersion } = await this.prismaService.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
      select: { tokenVersion: true },
    });

    const { accessToken, refreshToken } = this.generateTokens({
      sub: userId,
      version: tokenVersion,
    });

    await this.saveRefreshToken(userId, refreshToken);
    this.setRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  private generateTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtAccessSecret,
      expiresIn: this.accessTokenTtl,
      algorithm: 'HS256',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.jwtRefreshSecret,
      expiresIn: this.refreshTokenTtl,
      algorithm: 'HS256',
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: number, refreshToken: string) {
    const hash = await this.hashService.hash(refreshToken);
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken: hash },
    });
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    const isDevEnv = isDev(this.configService);

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      domain: this.cookieDomain,
      expires: new Date(Date.now() + Number(this.refreshTokenTtl) * 1000),
      secure: !isDevEnv,
      sameSite: 'lax',
    });
  }
}
