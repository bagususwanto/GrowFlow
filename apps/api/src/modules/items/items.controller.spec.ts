import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

describe('ItemsController', () => {
  let controller: ItemsController;
  let service: jest.Mocked<ItemsService>;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        { provide: ItemsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    service = module.get<ItemsService>(ItemsService) as jest.Mocked<ItemsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service findAll', async () => {
      const res = { data: [], total: 0, page: 1, limit: 10 };
      service.findAll.mockResolvedValue(res);
      expect(await controller.findAll({ page: 1, limit: 10 })).toEqual(res);
    });
  });

  describe('findOne', () => {
    it('should call service findOne', async () => {
      service.findOne.mockResolvedValue('res' as any);
      expect(await controller.findOne('id')).toBe('res');
    });
  });

  describe('create', () => {
    it('should call service create', async () => {
      service.create.mockResolvedValue('res' as any);
      expect(await controller.create({ code: 'c', name: 'n', unit: 'u' })).toBe('res');
    });
  });

  describe('update', () => {
    it('should call service update', async () => {
      service.update.mockResolvedValue('res' as any);
      expect(await controller.update('id', { name: 'n' })).toBe('res');
    });
  });

  describe('remove', () => {
    it('should call service remove', async () => {
      await controller.remove('id');
      expect(service.remove).toHaveBeenCalledWith('id');
    });
  });
});
