import { Test, TestingModule } from '@nestjs/testing';
import { AuthRepository } from './auth.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

describe('AuthRepository', () => {
  let repository: AuthRepository;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findUserByEmail', () => {
    it('should query prisma.user.findUnique with email and include role', async () => {
      const mockUser = { id: 'user-uuid', email: 'admin@growflow.com' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findUserByEmail('admin@growflow.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@growflow.com' },
        include: { role: true },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findUserById', () => {
    it('should query prisma.user.findUnique with id and include role', async () => {
      const mockUser = { id: 'user-uuid', email: 'admin@growflow.com' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findUserById('user-uuid');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
        include: { role: true },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('saveRefreshToken', () => {
    it('should query prisma.refreshToken.create with user data', async () => {
      const mockToken = { id: 'token-uuid', tokenHash: 'hash', userId: 'user-uuid' };
      const expiresAt = new Date();
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue(mockToken);

      const result = await repository.saveRefreshToken('user-uuid', 'hash', expiresAt);

      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-uuid',
          tokenHash: 'hash',
          expiresAt,
        },
      });
      expect(result).toEqual(mockToken);
    });
  });

  describe('findRefreshToken', () => {
    it('should query prisma.refreshToken.findUnique with tokenHash', async () => {
      const mockToken = { id: 'token-uuid', tokenHash: 'hash' };
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockToken);

      const result = await repository.findRefreshToken('hash');

      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: 'hash' },
      });
      expect(result).toEqual(mockToken);
    });
  });

  describe('revokeRefreshToken', () => {
    it('should query prisma.refreshToken.update to set revokedAt date', async () => {
      const mockToken = { id: 'token-uuid', revokedAt: new Date() };
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue(mockToken);

      const result = await repository.revokeRefreshToken('token-uuid');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-uuid' },
        data: { revokedAt: expect.any(Date) },
      });
      expect(result).toEqual(mockToken);
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should query prisma.refreshToken.updateMany to set revokedAt date for all user active tokens', async () => {
      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

      await repository.revokeAllUserTokens('user-uuid');

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });
});
