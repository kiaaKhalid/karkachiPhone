import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

// Simple ownership guard: ensures the :userId path param matches authenticated user id
@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    type RequestShape = {
      user?: { id?: string };
      params?: { userId?: string };
    };
    const req = context.switchToHttp().getRequest<RequestShape>();
    const user = req.user;
    const paramUserId = req.params?.userId;
    // If the route does not include a :userId param, skip here and let service enforce ownership
    if (!paramUserId) {
      if (!user?.id)
        throw new ForbiddenException('You can only act on your own resource');
      return true;
    }
    if (!user?.id || user.id !== paramUserId) {
      throw new ForbiddenException('You can only act on your own resource');
    }
    return true;
  }
}
