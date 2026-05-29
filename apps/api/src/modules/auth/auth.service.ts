import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { env } from '../../config/env.schema';
import { REFRESH_TOKEN_EXPIRES_DAYS } from '../../common/constants';
import { LoginResponse, AuthUser } from '@growflow/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name as AuthUser['role'],
      isActive: user.isActive,
    };

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
      {
        secret: env.JWT_ACCESS_SECRET,
        expiresIn: env.JWT_ACCESS_EXPIRES as never,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: env.JWT_REFRESH_SECRET,
        expiresIn: env.JWT_REFRESH_EXPIRES as never,
      },
    );

    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    await this.authRepository.saveRefreshToken(user.id, tokenHash, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: authUser,
    };
  }

  async refresh(refreshToken: string): Promise<LoginResponse> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: env.JWT_REFRESH_SECRET,
      });

      const tokenHash = this.hashToken(refreshToken);
      const tokenRecord = await this.authRepository.findRefreshToken(tokenHash);

      if (!tokenRecord) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (tokenRecord.revokedAt) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      if (new Date() > tokenRecord.expiresAt) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      const user = await this.authRepository.findUserById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User is inactive or not found');
      }

      // Revoke the old refresh token (Refresh Token Rotation)
      await this.authRepository.revokeRefreshToken(tokenRecord.id);

      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name as AuthUser['role'],
        isActive: user.isActive,
      };

      const accessToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
        },
        {
          secret: env.JWT_ACCESS_SECRET,
          expiresIn: env.JWT_ACCESS_EXPIRES as never,
        },
      );

      const newRefreshToken = await this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: env.JWT_REFRESH_SECRET,
          expiresIn: env.JWT_REFRESH_EXPIRES as never,
        },
      );

      const newTokenHash = this.hashToken(newRefreshToken);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

      await this.authRepository.saveRefreshToken(user.id, newTokenHash, expiresAt);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: authUser,
      };
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const tokenRecord = await this.authRepository.findRefreshToken(tokenHash);
    if (tokenRecord && !tokenRecord.revokedAt) {
      await this.authRepository.revokeRefreshToken(tokenRecord.id);
    }
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name as AuthUser['role'],
      isActive: user.isActive,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<AuthUser> {
    const user = await this.authRepository.updateUser(userId, { name: dto.name });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name as AuthUser['role'],
      isActive: user.isActive,
    };
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto): Promise<void> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect current password');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.authRepository.updateUser(userId, { passwordHash });
  }
}
