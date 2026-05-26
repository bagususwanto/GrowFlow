import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/infrastructure/prisma/prisma.service';
import { AllExceptionsFilter } from './../src/common/filters/all-exceptions.filter';
import { ResponseTransformInterceptor } from './../src/common/interceptors/response-transform.interceptor';
import * as bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';

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
    app.use(cookieParser()); // required so req.cookies is populated in controllers
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  /** Helper: login and return { accessToken, refreshCookie } */
  async function loginAndGetTokens() {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@growflow.com', password: 'Admin123!' })
      .expect(200);

    const accessToken = loginResponse.body.data.accessToken as string;
    // Extract only the name=value part of the cookie (strip Path, HttpOnly, etc.)
    // Browsers do this automatically; supertest requires it explicitly
    const setCookieHeader = loginResponse.headers['set-cookie'] as string | string[];
    const rawCookie = Array.isArray(setCookieHeader)
      ? setCookieHeader.find((c) => c.startsWith('growflow_refresh_token')) ?? ''
      : setCookieHeader ?? '';
    const refreshCookie = rawCookie.split(';')[0]; // e.g. "growflow_refresh_token=<jwt>"

    return { accessToken, refreshCookie };
  }

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@growflow.com', password: 'Admin123!' })
        .expect(200);

      // refreshToken must NOT be in the response body (it lives in an HTTP-only cookie)
      expect(loginResponse.body.data).toHaveProperty('accessToken');
      expect(loginResponse.body.data).not.toHaveProperty('refreshToken');
      expect(loginResponse.body.data.user.email).toBe('admin@growflow.com');
      expect(loginResponse.body.data.user.role).toBe('superadmin');

      // Refresh token must be set as an HTTP-only cookie
      const setCookieHeader = loginResponse.headers['set-cookie'] as string | string[];
      const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
      const refreshCookie = cookies.find((c) => c.startsWith('growflow_refresh_token'));
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');
    });

    it('should throw 401 with incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@growflow.com', password: 'wrong-password' })
        .expect(401);
    });

    it('should throw 401 if user does not exist', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nonexistent@growflow.com', password: 'Admin123!' })
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info when authorized', async () => {
      const { accessToken } = await loginAndGetTokens();

      const meResponse = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
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
    it('should return new tokens with valid refresh token cookie', async () => {
      const { refreshCookie } = await loginAndGetTokens();

      // Send the refresh token as a cookie (not in the request body)
      const refreshResponse = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(200);

      expect(refreshResponse.body.data).toHaveProperty('accessToken');
      expect(refreshResponse.body.data).not.toHaveProperty('refreshToken');

      // A new refresh token cookie must be set (token rotation)
      const newCookies = refreshResponse.headers['set-cookie'] as string | string[];
      const newCookieArr = Array.isArray(newCookies) ? newCookies : [newCookies];
      expect(newCookieArr.some((c) => c.startsWith('growflow_refresh_token'))).toBe(true);
    });

    it('should throw 401 when no refresh token cookie is provided', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should revoke token and return 204', async () => {
      const { accessToken, refreshCookie } = await loginAndGetTokens();

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', refreshCookie)
        .expect(204);
    });
  });
});


