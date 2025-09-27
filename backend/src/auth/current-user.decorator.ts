import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type AuthUser = { id?: string } & Record<string, unknown>;

// Usage: @CurrentUser() user, or @CurrentUser('id') userId
export const CurrentUser = createParamDecorator<keyof AuthUser | undefined>(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user: AuthUser | undefined = request?.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
