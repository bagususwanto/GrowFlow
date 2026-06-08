import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  const mockExecutionContext = (userPerms: string[] | undefined, requiredPerms: string[] | null): ExecutionContext => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredPerms);

    const mockRequest = {
      user: userPerms ? { permissions: userPerms } : undefined,
    };

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;
  };

  it('should return true if no permissions are required', () => {
    const context = mockExecutionContext(['read:items'], null);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return false if user has no permissions or user is not logged in', () => {
    const context1 = mockExecutionContext(undefined, ['read:items']);
    const context2 = mockExecutionContext(undefined, ['read:items']);
    expect(guard.canActivate(context1)).toBe(false);
    expect(guard.canActivate(context2)).toBe(false);
  });

  it('should return true if user has superadmin wildcard permission (*)', () => {
    const context = mockExecutionContext(['*'], ['read:items', 'write:users']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true if user has exact required permission', () => {
    const context = mockExecutionContext(['read:items'], ['read:items']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return false if user does not have exact required permission', () => {
    const context = mockExecutionContext(['read:items'], ['write:items']);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return true if user has all required permissions (AND logic)', () => {
    const context = mockExecutionContext(['read:items', 'write:items'], ['read:items', 'write:items']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return false if user is missing one of the required permissions (AND logic)', () => {
    const context = mockExecutionContext(['read:items'], ['read:items', 'write:items']);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should support action wildcards (e.g. create:* matches create:items)', () => {
    const context = mockExecutionContext(['create:*'], ['create:items']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should support resource wildcards (e.g. *:items matches create:items)', () => {
    const context = mockExecutionContext(['*:items'], ['create:items']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should map write permission to create permission', () => {
    const context = mockExecutionContext(['write:items'], ['create:items']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should map write permission to update permission', () => {
    const context = mockExecutionContext(['write:items'], ['update:items']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should map write permission to delete permission', () => {
    const context = mockExecutionContext(['write:items'], ['delete:items']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should map write permission to confirm permission', () => {
    const context = mockExecutionContext(['write:items'], ['confirm:items']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should not map write permission to read permission', () => {
    const context = mockExecutionContext(['write:items'], ['read:items']);
    expect(guard.canActivate(context)).toBe(false);
  });
});
