import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { OwnershipGuard } from './ownership.guard';
import { UserRole } from '../../users/enums/user-role.enum';

const contextFor = (sub: string, role: UserRole, paramId: string) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user: { sub, role }, params: { id: paramId } }),
    }),
  }) as unknown as ExecutionContext;

describe('OwnershipGuard', () => {
  const guard = new OwnershipGuard();

  it('allows the account owner', () => {
    expect(guard.canActivate(contextFor('u1', UserRole.COLLECTOR, 'u1'))).toBe(
      true,
    );
  });

  it('allows an admin on any account', () => {
    expect(guard.canActivate(contextFor('admin', UserRole.ADMIN, 'u1'))).toBe(
      true,
    );
  });

  it('rejects another user', () => {
    expect(() =>
      guard.canActivate(contextFor('u2', UserRole.COLLECTOR, 'u1')),
    ).toThrow(ForbiddenException);
  });
});
