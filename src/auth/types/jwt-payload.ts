import { UserRole } from '../../users/enums/user-role.enum';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
