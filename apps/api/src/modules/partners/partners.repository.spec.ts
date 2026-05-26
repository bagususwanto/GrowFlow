import { Test, TestingModule } from '@nestjs/testing';
import { PartnersRepository } from './partners.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

describe('PartnersRepository', () => {
  let repository: PartnersRepository;
  let prisma: any;

  const mockDate = new Date();
  const mockPartner = { id: 'p-id', code: 'PRT1', name: 'Partner 1', type: 'SUPPLIER', email: 'a@a.com', phone: '123', address: 'addr', isActive: true, createdAt: mockDate, updatedAt: mockDate, deletedAt: null };

  const mockPrismaService = {
    partner: {
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
        PartnersRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<PartnersRepository>(PartnersRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated partners', async () => {
      prisma.partner.findMany.mockResolvedValue([mockPartner]);
      prisma.partner.count.mockResolvedValue(1);
      const res = await repository.findAll({ skip: 0, take: 10 });
      expect(res).toEqual([[mockPartner], 1]);
    });
  });

  describe('findById', () => {
    it('should find active partner by id', async () => {
      prisma.partner.findUnique.mockResolvedValue(mockPartner);
      const res = await repository.findById('p-id');
      expect(res).toEqual(mockPartner);
    });
  });

  describe('findByCode', () => {
    it('should find active partner by code', async () => {
      prisma.partner.findFirst.mockResolvedValue(mockPartner);
      const res = await repository.findByCode('PRT1');
      expect(res).toEqual(mockPartner);
    });
  });

  describe('create', () => {
    it('should create partner', async () => {
      prisma.partner.create.mockResolvedValue(mockPartner);
      const res = await repository.create({ code: 'PRT1', name: 'Partner 1', type: 'SUPPLIER' });
      expect(res).toEqual(mockPartner);
    });
  });

  describe('update', () => {
    it('should update partner', async () => {
      prisma.partner.update.mockResolvedValue(mockPartner);
      const res = await repository.update('p-id', { name: 'Partner 2' });
      expect(res).toEqual(mockPartner);
    });
  });

  describe('softDelete', () => {
    it('should soft delete partner', async () => {
      prisma.partner.update.mockResolvedValue({ ...mockPartner, isActive: false, deletedAt: new Date() });
      await repository.softDelete('p-id');
      expect(prisma.partner.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p-id' },
          data: expect.objectContaining({ deletedAt: expect.any(Date), isActive: false }),
        })
      );
    });
  });
});
