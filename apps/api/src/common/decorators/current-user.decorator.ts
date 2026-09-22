import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Role } from '@prisma/client';

export interface JwtUser {
  id: string;
  email: string;
  role: Role;
}

export const CurrentUser = createParamDecorator((data: keyof JwtUser | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as JwtUser | undefined;
  return data && user ? user[data] : user;
});
