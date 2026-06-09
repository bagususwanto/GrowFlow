import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate and return user payload successfully', () => {
      const payload = {
        sub: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'sales',
        permissions: ['read:items'],
        isActive: true,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'sales',
        isActive: true,
        permissions: ['read:items'],
      });
    });

    it('should throw UnauthorizedException if user is inactive', () => {
      const payload = {
        sub: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'sales',
        permissions: ['read:items'],
        isActive: false,
      };

      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
    });

    it('should default isActive to true if not present in payload', () => {
      const payload = {
        sub: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'sales',
        permissions: ['read:items'],
      };

      const result = strategy.validate(payload);
      expect(result.isActive).toBe(true);
    });
  });
});
