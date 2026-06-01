import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let service: jest.Mocked<RolesService>;

  const mockRoleResponse = {
    id: 'role-id',
    name: 'staff',
    permissions: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        { provide: RolesService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService) as jest.Mocked<RolesService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service create', async () => {
      const dto = { name: 'staff', permissions: [] };
      service.create.mockResolvedValue(mockRoleResponse);
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockRoleResponse);
    });
  });

  describe('findAll', () => {
    it('should call service findAll', async () => {
      const res = { data: [mockRoleResponse], total: 1, page: 1, limit: 10 };
      service.findAll.mockResolvedValue(res);
      const query = { page: 1, limit: 10 };
      const result = await controller.findAll(query);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(res);
    });
  });

  describe('findOne', () => {
    it('should call service findOne', async () => {
      service.findOne.mockResolvedValue(mockRoleResponse);
      const result = await controller.findOne('role-id');
      expect(result).toEqual(mockRoleResponse);
    });
  });

  describe('update', () => {
    it('should call service update', async () => {
      const dto = { name: 'updated' };
      service.update.mockResolvedValue(mockRoleResponse);
      const result = await controller.update('role-id', dto);
      expect(service.update).toHaveBeenCalledWith('role-id', dto);
      expect(result).toEqual(mockRoleResponse);
    });
  });

  describe('remove', () => {
    it('should call service remove', async () => {
      await controller.remove('role-id');
      expect(service.remove).toHaveBeenCalledWith('role-id');
    });
  });
});
