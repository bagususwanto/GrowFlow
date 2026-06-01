import { Test, TestingModule } from '@nestjs/testing';
import { CategoryItemsService } from './category-items.service';
import { CategoryItemsRepository } from './category-items.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CategoryItem } from '@prisma/client';

describe('CategoryItemsService', () => {
  let service: CategoryItemsService;
  let repository: jest.Mocked<CategoryItemsRepository>;

  const mockDate = new Date('2026-06-01T12:00:00.000Z');

  const mockCategoryItem: CategoryItem = {
    id: 'cat-1',
    name: 'Test Category',
    description: 'Test Description',
    isActive: true,
    deletedAt: null,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      countActiveItems: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryItemsService,
        { provide: CategoryItemsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CategoryItemsService>(CategoryItemsService);
    repository = module.get(CategoryItemsRepository) as jest.Mocked<CategoryItemsRepository>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a paginated list of categories', async () => {
      repository.findAll.mockResolvedValue([[mockCategoryItem], 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].id).toBe('cat-1');
      expect(repository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, 0, 10);
    });
  });

  describe('findOne', () => {
    it('should return a single category if found', async () => {
      repository.findById.mockResolvedValue(mockCategoryItem);

      const result = await service.findOne('cat-1');

      expect(result.id).toBe('cat-1');
      expect(repository.findById).toHaveBeenCalledWith('cat-1');
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('cat-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new category if name is unique', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockCategoryItem);

      const result = await service.create({ name: 'Test Category', description: 'Test Description' });

      expect(result.id).toBe('cat-1');
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if name already exists', async () => {
      repository.findByName.mockResolvedValue(mockCategoryItem);

      await expect(
        service.create({ name: 'Test Category', description: 'Test Description' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update the category if found and name is unique/same', async () => {
      repository.findById.mockResolvedValue(mockCategoryItem);
      repository.update.mockResolvedValue({ ...mockCategoryItem, description: 'Updated' });

      const result = await service.update('cat-1', { description: 'Updated' });

      expect(result.description).toBe('Updated');
      expect(repository.update).toHaveBeenCalled();
    });

    it('should throw ConflictException if updating to an existing name', async () => {
      repository.findById.mockResolvedValue(mockCategoryItem);
      repository.findByName.mockResolvedValue({ ...mockCategoryItem, id: 'cat-2', name: 'Other' });

      await expect(service.update('cat-1', { name: 'Other' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete category if it has no active items', async () => {
      repository.findById.mockResolvedValue(mockCategoryItem);
      repository.countActiveItems.mockResolvedValue(0);
      repository.softDelete.mockResolvedValue(mockCategoryItem);

      await service.remove('cat-1');

      expect(repository.softDelete).toHaveBeenCalledWith('cat-1');
    });

    it('should throw ConflictException if category has active items', async () => {
      repository.findById.mockResolvedValue(mockCategoryItem);
      repository.countActiveItems.mockResolvedValue(2);

      await expect(service.remove('cat-1')).rejects.toThrow(ConflictException);
    });
  });
});
