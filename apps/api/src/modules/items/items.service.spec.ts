import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { ItemsRepository } from './items.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ItemsService', () => {
  let service: ItemsService;
  let repository: any;

  const mockDate = new Date();
  const mockCategory = { id: 'c-id', name: 'Cat', description: null, isActive: true, deletedAt: null, createdAt: mockDate, updatedAt: mockDate };
  const mockItem = { id: 'i-id', code: 'ITM1', name: 'Item 1', unit: 'pcs', categoryId: 'c-id', category: mockCategory, minStock: 10, isActive: true, deletedAt: null, createdAt: mockDate, updatedAt: mockDate };
  const mockResponse = {
    id: 'i-id',
    code: 'ITM1',
    name: 'Item 1',
    unit: 'pcs',
    categoryId: 'c-id',
    category: { id: 'c-id', name: 'Cat', description: null, isActive: true, deletedAt: null, createdAt: mockDate.toISOString(), updatedAt: mockDate.toISOString() },
    minStock: 10,
    isActive: true,
    deletedAt: null,
    createdAt: mockDate.toISOString(),
    updatedAt: mockDate.toISOString(),
  };

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findLastPurchasePrice: jest.fn(),
    findLastSalesPrice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        { provide: ItemsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    repository = module.get<ItemsRepository>(ItemsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return mapped items and delegate to repository correctly', async () => {
      repository.findAll.mockResolvedValue([[mockItem], 1]);
      const query = { page: 2, limit: 5, search: 'Item', sortBy: 'name', sortOrder: 'asc' as const };
      const res = await service.findAll(query);
      expect(res).toEqual({ data: [mockResponse], total: 1, page: 2, limit: 5 });
      expect(repository.findAll).toHaveBeenCalledWith(query, 5, 5);
    });
  });

  describe('findOne', () => {
    it('should return mapped item', async () => {
      repository.findById.mockResolvedValue(mockItem);
      const res = await service.findOne('i-id');
      expect(res).toEqual(mockResponse);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findOne('i-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create mapped item', async () => {
      repository.findByCode.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockItem);
      const res = await service.create({ code: 'ITM1', name: 'Item 1', unit: 'pcs' });
      expect(res).toEqual(mockResponse);
    });

    it('should throw ConflictException if code exists', async () => {
      repository.findByCode.mockResolvedValue(mockItem);
      await expect(service.create({ code: 'ITM1', name: 'Item 1', unit: 'pcs' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update mapped item', async () => {
      repository.findById.mockResolvedValue(mockItem);
      repository.findByCode.mockResolvedValue(null);
      repository.update.mockResolvedValue(mockItem);
      const res = await service.update('i-id', { name: 'Item 1' });
      expect(res).toEqual(mockResponse);
    });

    it('should throw ConflictException if new code exists', async () => {
      repository.findById.mockResolvedValue(mockItem);
      repository.findByCode.mockResolvedValue({ id: 'other' });
      await expect(service.update('i-id', { code: 'ITM2' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should call soft delete', async () => {
      repository.findById.mockResolvedValue(mockItem);
      await service.remove('i-id');
      expect(repository.softDelete).toHaveBeenCalledWith('i-id');
    });
  });
});
