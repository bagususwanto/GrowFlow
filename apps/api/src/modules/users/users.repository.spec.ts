import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let prisma: any;

  const mockUserWithRole = {
    id: 'user-id',
    name: 'Test User',
    email: 'test@test.com',
    passwordHash: 'hash',
    roleId: 'role-id',
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: { id: 'role-id', name: 'staff' },
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated active users', async () => {
      prisma.user.findMany.mockResolvedValue([mockUserWithRole]);

      const result = await repository.findAll(0, 10);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: { role: true },
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockUserWithRole]);
    });
  });

  describe('count', () => {
    it('should return count of active users', async () => {
      prisma.user.count.mockResolvedValue(5);
      const result = await repository.count();
      expect(prisma.user.count).toHaveBeenCalledWith({ where: { deletedAt: null } });
      expect(result).toEqual(5);
    });
  });

  describe('findById', () => {
    it('should return a user by ID if active', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUserWithRole);
      const result = await repository.findById('user-id');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id', deletedAt: null },
        include: { role: true },
      });
      expect(result).toEqual(mockUserWithRole);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email if active', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUserWithRole);
      const result = await repository.findByEmail('test@test.com');
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@test.com', deletedAt: null },
        include: { role: true },
      });
      expect(result).toEqual(mockUserWithRole);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      prisma.user.create.mockResolvedValue(mockUserWithRole);
      const data = { name: 'Test User', email: 'test@test.com', passwordHash: 'hash', roleId: 'role-id' };
      const result = await repository.create(data);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data,
        include: { role: true },
      });
      expect(result).toEqual(mockUserWithRole);
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      prisma.user.update.mockResolvedValue(mockUserWithRole);
      const data = { name: 'Updated Name' };
      const result = await repository.update('user-id', data);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data,
        include: { role: true },
      });
      expect(result).toEqual(mockUserWithRole);
    });
  });

  describe('softDelete', () => {
    it('should mark the user as deleted and inactive', async () => {
      prisma.user.update.mockResolvedValue({ ...mockUserWithRole, isActive: false, deletedAt: new Date() });
      await repository.softDelete('user-id');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { deletedAt: expect.any(Date), isActive: false },
        include: { role: true },
      });
    });
  });
});
