import { Test, TestingModule } from '@nestjs/testing';
import { PartnersService } from './partners.service';
import { PartnersRepository } from './partners.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('PartnersService', () => {
  let service: PartnersService;
  let repository: any;

  const mockDate = new Date();
  const mockPartner = { id: 'p-id', code: 'PRT1', name: 'Partner 1', type: 'SUPPLIER', email: 'a@a.com', phone: '123', address: 'addr', isActive: true, createdAt: mockDate, updatedAt: mockDate, deletedAt: null };
  const mockResponse = { id: 'p-id', code: 'PRT1', name: 'Partner 1', type: 'SUPPLIER', email: 'a@a.com', phone: '123', address: 'addr', isActive: true, createdAt: mockDate.toISOString(), updatedAt: mockDate.toISOString() };

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnersService,
        { provide: PartnersRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<PartnersService>(PartnersService);
    repository = module.get<PartnersRepository>(PartnersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return mapped partners', async () => {
      repository.findAll.mockResolvedValue([[mockPartner], 1]);
      const res = await service.findAll({ page: 1, limit: 10, search: 'Part' });
      expect(res).toEqual({ data: [mockResponse], total: 1, page: 1, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('should return mapped partner', async () => {
      repository.findById.mockResolvedValue(mockPartner);
      const res = await service.findOne('p-id');
      expect(res).toEqual(mockResponse);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findOne('p-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create mapped partner', async () => {
      repository.findByCode.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockPartner);
      const res = await service.create({ code: 'PRT1', name: 'Partner 1', type: 'SUPPLIER' });
      expect(res).toEqual(mockResponse);
    });

    it('should throw ConflictException if code exists', async () => {
      repository.findByCode.mockResolvedValue(mockPartner);
      await expect(service.create({ code: 'PRT1', name: 'Partner 1', type: 'SUPPLIER' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update mapped partner', async () => {
      repository.findById.mockResolvedValue(mockPartner);
      repository.findByCode.mockResolvedValue(null);
      repository.update.mockResolvedValue(mockPartner);
      const res = await service.update('p-id', { name: 'Partner 1' });
      expect(res).toEqual(mockResponse);
    });

    it('should throw ConflictException if new code exists', async () => {
      repository.findById.mockResolvedValue(mockPartner);
      repository.findByCode.mockResolvedValue({ id: 'other' });
      await expect(service.update('p-id', { code: 'PRT2' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should call soft delete', async () => {
      repository.findById.mockResolvedValue(mockPartner);
      await service.remove('p-id');
      expect(repository.softDelete).toHaveBeenCalledWith('p-id');
    });
  });
});
