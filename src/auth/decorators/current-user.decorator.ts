import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload, RequestWithUser } from '../types/jwt-payload';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
