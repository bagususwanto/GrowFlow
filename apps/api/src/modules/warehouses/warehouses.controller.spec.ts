import { Test, TestingModule } from '@nestjs/testing';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';

describe('WarehousesController', () => {
  let controller: WarehousesController;
  let service: any;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarehousesController],
      providers: [
        { provide: WarehousesService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<WarehousesController>(WarehousesController);
    service = module.get<WarehousesService>(WarehousesService);
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
      service.findOne.mockResolvedValue('res');
      expect(await controller.findOne('id')).toBe('res');
    });
  });

  describe('create', () => {
    it('should call service create', async () => {
      service.create.mockResolvedValue('res');
      expect(await controller.create({ name: 'n' })).toBe('res');
    });
  });

  describe('update', () => {
    it('should call service update', async () => {
      service.update.mockResolvedValue('res');
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
