import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/enums/user-role.enum';

const contextFor = (role: UserRole): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ user: { sub: 'u', role } }) }),
    getHandler: () => null,
    getClass: () => null,
  }) as unknown as ExecutionContext;

const guardWith = (required: UserRole[] | undefined) => {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(required),
  } as unknown as Reflector;
  return new RolesGuard(reflector);
};

describe('RolesGuard', () => {
  it('allows when no role is required', () => {
    expect(
      guardWith(undefined).canActivate(contextFor(UserRole.COLLECTOR)),
    ).toBe(true);
  });

  it('allows when the user has one of the required roles', () => {
    expect(
      guardWith([UserRole.ADMIN, UserRole.GALLERY]).canActivate(
        contextFor(UserRole.GALLERY),
      ),
    ).toBe(true);
  });

  it('rejects when the user lacks the required role', () => {
    expect(() =>
      guardWith([UserRole.ADMIN]).canActivate(contextFor(UserRole.COLLECTOR)),
    ).toThrow(ForbiddenException);
  });
});
