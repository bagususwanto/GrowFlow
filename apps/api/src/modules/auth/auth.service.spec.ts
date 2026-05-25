import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let repository: jest.Mocked<AuthRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockRole = {
    id: 'role-id',
    name: 'superadmin',
    permissions: '["*"]',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-id',
    name: 'Test Admin',
    email: 'admin@growflow.com',
    passwordHash: '',
    isActive: true,
    deletedAt: null,
    roleId: 'role-id',
    role: mockRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    mockUser.passwordHash = hashedPassword;

    const mockAuthRepository = {
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      saveRefreshToken: jest.fn(),
      findRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeAllUserTokens: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get(AuthRepository);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return LoginResponse when credentials are valid', async () => {
      repository.findUserByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.login({
        email: 'admin@growflow.com',
        password: 'Admin123!',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('admin@growflow.com');
      expect(repository.findUserByEmail).toHaveBeenCalledWith('admin@growflow.com');
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      repository.findUserByEmail.mockResolvedValue(mockUser);

      await expect(
        service.login({
          email: 'admin@growflow.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      repository.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@growflow.com',
          password: 'Admin123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should rotate tokens successfully with valid refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-id' });
      repository.findRefreshToken.mockResolvedValue({
        id: 'token-id',
        tokenHash: 'hashed-token',
        userId: 'user-id',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour in future
        revokedAt: null,
        createdAt: new Date(),
      });
      repository.findUserById.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('new-mock-token');

      const result = await service.refresh('mock-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(repository.revokeRefreshToken).toHaveBeenCalledWith('token-id');
    });
  });
});
