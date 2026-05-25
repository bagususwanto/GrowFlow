import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/modules/prisma/prisma.service';
import { AllExceptionsFilter } from './../src/common/filters/all-exceptions.filter';
import { ResponseTransformInterceptor } from './../src/common/interceptors/response-transform.interceptor';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let mockPrismaService: Record<string, Record<string, jest.Mock>>;
  let hashedPassword = '';

  const mockRole = {
    id: 'role-id',
    name: 'superadmin',
    permissions: '["*"]',
  };

  const mockUser = {
    id: 'user-id',
    name: 'Test Admin',
    email: 'admin@growflow.com',
    passwordHash: '',
    isActive: true,
    roleId: 'role-id',
    role: mockRole,
  };

  const mockRefreshTokenRecord = {
    id: 'token-id',
    tokenHash: '',
    userId: 'user-id',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
    revokedAt: null,
  };

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash('Admin123!', 10);
    mockUser.passwordHash = hashedPassword;
  });

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.email === mockUser.email || where.id === mockUser.id) {
            return Promise.resolve(mockUser);
          }
          return Promise.resolve(null);
        }),
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue(mockRefreshTokenRecord),
        findUnique: jest.fn().mockImplementation(() => {
          return Promise.resolve(mockRefreshTokenRecord);
        }),
        update: jest.fn().mockResolvedValue({
          ...mockRefreshTokenRecord,
          revokedAt: new Date(),
        }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@growflow.com',
          password: 'Admin123!',
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe('admin@growflow.com');
      expect(response.body.data.user.role).toBe('superadmin');
    });

    it('should throw 401 with incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@growflow.com',
          password: 'wrong-password',
        })
        .expect(401);
    });

    it('should throw 401 if user does not exist', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@growflow.com',
          password: 'Admin123!',
        })
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info when authorized', async () => {
      // 1. Get token
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@growflow.com',
          password: 'Admin123!',
        });
      const token = loginResponse.body.data.accessToken;

      // 2. Call /me
      const meResponse = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(meResponse.body.data.email).toBe('admin@growflow.com');
      expect(meResponse.body.data.id).toBe('user-id');
    });

    it('should throw 401 when token is missing', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return new tokens with valid refresh token', async () => {
      // 1. Get refresh token
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@growflow.com',
          password: 'Admin123!',
        });
      const refreshToken = loginResponse.body.data.refreshToken;

      // 2. Refresh
      const refreshResponse = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body.data).toHaveProperty('accessToken');
      expect(refreshResponse.body.data).toHaveProperty('refreshToken');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should revoke token and return 204', async () => {
      // 1. Get refresh token
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@growflow.com',
          password: 'Admin123!',
        });
      const refreshToken = loginResponse.body.data.refreshToken;
      const token = loginResponse.body.data.accessToken;

      // 2. Logout
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken })
        .expect(204);
    });
  });
});
