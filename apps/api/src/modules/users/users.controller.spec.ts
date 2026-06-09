import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUserResponse = {
    id: 'user-id',
    name: 'Test User',
    email: 'test@test.com',
    roleId: 'role-id',
    role: { id: 'role-id', name: 'sales' as any },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService) as jest.Mocked<UsersService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service create', async () => {
      const dto: CreateUserDto = { name: 'Test User', email: 'test@test.com', password: 'password', roleId: 'role-id' };
      service.create.mockResolvedValue(mockUserResponse);

      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('findAll', () => {
    it('should call service findAll with pagination params', async () => {
      const paginatedResponse = { data: [mockUserResponse], total: 1, page: 2, limit: 5 };
      service.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll({ page: 2, limit: 5 });
      expect(service.findAll).toHaveBeenCalledWith({ page: 2, limit: 5 });
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should call service findOne', async () => {
      service.findOne.mockResolvedValue(mockUserResponse);

      const result = await controller.findOne('user-id');
      expect(service.findOne).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('update', () => {
    it('should call service update', async () => {
      const dto: UpdateUserDto = { name: 'Updated Name' };
      service.update.mockResolvedValue({ ...mockUserResponse, name: 'Updated Name' });

      const result = await controller.update('user-id', dto);
      expect(service.update).toHaveBeenCalledWith('user-id', dto);
      expect(result.name).toEqual('Updated Name');
    });
  });

  describe('remove', () => {
    it('should call service remove', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('user-id');
      expect(service.remove).toHaveBeenCalledWith('user-id');
    });
  });
});
