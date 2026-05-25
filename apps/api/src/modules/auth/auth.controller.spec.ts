import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthUser } from '@growflow/types';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const mockUser: AuthUser = {
    id: 'user-uuid',
    name: 'Super Admin',
    email: 'admin@growflow.com',
    role: 'superadmin',
    isActive: true,
  };

  const mockAuthService = {
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    getMe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should set cookie and return tokens without refreshToken in body', async () => {
      const loginDto = { email: 'admin@growflow.com', password: 'Admin123!' };
      const loginResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      };

      service.login.mockResolvedValue(loginResult);

      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(loginDto, mockRes);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect((mockRes.cookie as jest.Mock)).toHaveBeenCalledWith(
        'growflow_refresh_token',
        'refresh-token',
        expect.any(Object),
      );
      expect(result).toEqual({
        accessToken: 'access-token',
        user: mockUser,
      });
    });
  });

  describe('refresh', () => {
    it('should extract cookie, set new cookie, and return new access token', async () => {
      const refreshResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: mockUser,
      };

      service.refresh.mockResolvedValue(refreshResult);

      const mockReq = {
        cookies: {
          growflow_refresh_token: 'old-refresh-token',
        },
      } as unknown as Request;

      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.refresh(mockReq, mockRes);

      expect(service.refresh).toHaveBeenCalledWith('old-refresh-token');
      expect((mockRes.cookie as jest.Mock)).toHaveBeenCalledWith(
        'growflow_refresh_token',
        'new-refresh-token',
        expect.any(Object),
      );
      expect(result).toEqual({
        accessToken: 'new-access-token',
        user: mockUser,
      });
    });

    it('should throw UnauthorizedException if no cookie is present', async () => {
      const mockReq = { cookies: {} } as unknown as Request;
      const mockRes = {} as unknown as Response;

      await expect(controller.refresh(mockReq, mockRes)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should call service logout and clear cookie if token is present', async () => {
      const mockReq = {
        cookies: {
          growflow_refresh_token: 'active-refresh-token',
        },
      } as unknown as Request;

      const mockRes = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.logout(mockReq, mockRes);

      expect(service.logout).toHaveBeenCalledWith('active-refresh-token');
      expect((mockRes.clearCookie as jest.Mock)).toHaveBeenCalledWith(
        'growflow_refresh_token',
        expect.any(Object),
      );
    });
  });

  describe('getMe', () => {
    it('should return user info from service', async () => {
      service.getMe.mockResolvedValue(mockUser);

      const result = await controller.getMe(mockUser);

      expect(service.getMe).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });
});
