import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RequestWithUser } from '../types/jwt-payload';
import { UserRole } from '../../users/enums/user-role.enum';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const { user, params } = context
      .switchToHttp()
      .getRequest<RequestWithUser>();

    if (user.role === UserRole.ADMIN) return true;
    if (user.sub === params.id) return true;

    throw new ForbiddenException('You can only access your own account');
  }
}
