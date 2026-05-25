import { Test, TestingModule } from '@nestjs/testing';
import { WarehousesService } from './warehouses.service';
import { WarehousesRepository } from './warehouses.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('WarehousesService', () => {
  let service: WarehousesService;
  let repository: any;

  const mockDate = new Date();
  const mockWarehouse = { id: 'w-id', name: 'Main', address: '123', isActive: true, createdAt: mockDate, updatedAt: mockDate, deletedAt: null };
  const mockResponse = { id: 'w-id', name: 'Main', address: '123', isActive: true, createdAt: mockDate.toISOString(), updatedAt: mockDate.toISOString() };

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarehousesService,
        { provide: WarehousesRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<WarehousesService>(WarehousesService);
    repository = module.get<WarehousesRepository>(WarehousesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return mapped warehouses', async () => {
      repository.findAll.mockResolvedValue([[mockWarehouse], 1]);
      const res = await service.findAll({ page: 1, limit: 10, search: 'M' });
      expect(res).toEqual({ data: [mockResponse], total: 1, page: 1, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('should return mapped warehouse', async () => {
      repository.findById.mockResolvedValue(mockWarehouse);
      const res = await service.findOne('w-id');
      expect(res).toEqual(mockResponse);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findOne('w-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create mapped warehouse', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockWarehouse);
      const res = await service.create({ name: 'Main' });
      expect(res).toEqual(mockResponse);
    });

    it('should throw ConflictException if name exists', async () => {
      repository.findByName.mockResolvedValue(mockWarehouse);
      await expect(service.create({ name: 'Main' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update mapped warehouse', async () => {
      repository.findById.mockResolvedValue(mockWarehouse);
      repository.findByName.mockResolvedValue(null);
      repository.update.mockResolvedValue(mockWarehouse);
      const res = await service.update('w-id', { name: 'Main' });
      expect(res).toEqual(mockResponse);
    });

    it('should throw ConflictException if new name exists', async () => {
      repository.findById.mockResolvedValue(mockWarehouse);
      repository.findByName.mockResolvedValue({ id: 'other' });
      await expect(service.update('w-id', { name: 'Main 2' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should call soft delete', async () => {
      repository.findById.mockResolvedValue(mockWarehouse);
      await service.remove('w-id');
      expect(repository.softDelete).toHaveBeenCalledWith('w-id');
    });
  });
});
